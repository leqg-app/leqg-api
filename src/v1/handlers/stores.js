const S = require("fluent-json-schema");

const { Store } = require("../../entity/Store.js");
const { StoreRevision } = require("../../entity/StoreRevision.js");
const { Version } = require("../../entity/Version.js");
const { Contribution } = require("../../entity/Contribution.js");
const { StoreValidation } = require("../../entity/StoreValidation.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");
const { formatStore, formatStores } = require("../utils/format.js");
const diffMapper = require("../utils/diffMapper.js");
const { getCoordinatesDistance } = require("../utils/coordinates.js");
const { calculateReputation } = require("../utils/reputation.js");
const REPUTATIONS = require("../../reputations.js");

const STORE_REVISION_FIELDS = [
  "name",
  "address",
  "longitude",
  "latitude",
  "website",
  "phone",
  "schedules",
  "products",
  "features",
];

const getAllStores = {
  schema: {
    summary: "Get all stores",
    tags: ["store"],
    response: {
      200: S.array().items(S.ref("storeMinified")),
    },
  },
  handler: async (req) => {
    const storeRepo = req.server.db.getRepository(Store);
    const stores = await storeRepo.find();
    return stores.map(formatStores);
  },
};

const getStore = {
  schema: {
    summary: "Get a store",
    tags: ["store"],
    params: S.object().prop("id", S.integer().required()),
    response: {
      200: S.ref("storeSchema"),
    },
  },
  handler: async (req, reply) => {
    const { id } = req.params;
    const storeRepo = req.server.db.getRepository(Store);
    const store = await storeRepo.findOne({
      where: { id },
      relations: ["revisions.user"],
    });

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    return formatStore(store);
  },
};

const createStore = {
  schema: {
    summary: "Create a store",
    tags: ["store"],
    body: S.ref("storeBaseSchemav1"),
    response: {
      200: S.ref("storeSchema"),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, rep) => {
    // TOFIX: v2
    req.body.products.map((p) => {
      p.productId = p.product;
      delete p.product;
    });

    req.body.features = req.body.features.map((id) => ({ id }));

    const repoStore = req.server.db.getRepository(Store);
    const store = await repoStore.save(req.body);

    const repoVersion = req.server.db.getRepository(Version);
    let { version } = await repoVersion.findOneBy({ name: "stores" });

    const changes = diffMapper({}, store, STORE_REVISION_FIELDS);
    const reputation = calculateReputation([], changes, req.user.id);

    // Create revision
    const revision = await req.server.db.manager.save(StoreRevision, {
      store: store.id,
      version: ++version,
      user: req.user.id,
      changes: [{ type: "initial" }],
      contribution: {
        user: req.user.id,
        reputation: reputation.total,
        reason: "store.creation",
      },
    });

    // Set revision into store response
    delete revision.store;
    revision.user = { username: req.user.username };

    store.revisions = [revision];

    // Upgrade version
    await repoVersion.update({ name: "stores" }, { version });

    return repoStore
      .findOne({
        where: { id: store.id },
        relations: ["revisions.user"],
      })
      .then(formatStore);
  },
};

const updateStore = {
  schema: {
    summary: "Update store",
    tags: ["store"],
    params: S.object().prop("id", S.integer().required()),
    body: S.ref("storeBaseSchemav1"),
    response: {
      200: S.object()
        .prop("store", S.ref("storeSchema"))
        .prop("contributed", S.boolean())
        .prop(
          "reputation",
          S.object()
            .prop("total", S.integer())
            .prop(
              "fields",
              S.array().items(
                S.object()
                  .prop("field", S.string())
                  .prop("reputation", S.integer())
              )
            )
        )
        .prop("version", S.integer()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { id } = req.params;
    const repoStore = req.server.db.getRepository(Store);
    const store = await repoStore.findOne({
      where: { id },
      relations: ["revisions.user"],
    });

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    // TOFIX: v2
    req.body.products.map((p) => {
      p.productId = p.product;
      delete p.product;
    });

    req.body.id = id;
    req.body.features = req.body.features.map((id) => ({ id }));

    await repoStore.save(req.body);
    const updated = await repoStore.findOne({
      where: { id },
      relations: ["revisions.user"],
    });

    const changes = diffMapper(store, updated, STORE_REVISION_FIELDS);

    if (!changes.length) {
      return {
        store: formatStore(store),
        contributed: false,
      };
    }

    // Upgrade version
    const repoVersion = req.server.db.getRepository(Version);
    let { version } = await repoVersion.findOneBy({ name: "stores" });
    await repoVersion.update({ name: "stores" }, { version: ++version });

    // Calculate new reputation
    const reputation = calculateReputation(
      store.revisions,
      changes,
      req.user.id
    );

    // No new reputation, we don't store revision
    if (!reputation.total) {
      return {
        store: formatStore(updated),
        contributed: false,
        version,
        reputation,
      };
    }

    // Create revision
    const revision = await req.server.db.manager.save(StoreRevision, {
      store: store.id,
      user: req.user.id,
      version,
      changes,
      contribution: {
        user: req.user.id,
        reputation: reputation.total,
        reason: "store.edition",
      },
    });

    // Set revision into store response
    delete revision.store;
    revision.user = { username: req.user.username };

    updated.revisions.push(revision);

    return {
      store: formatStore(updated),
      contributed: true, // TOFIX: v2
      version,
      reputation,
    };
  },
};

const MAX_VALIDATION_DISTANCE = 0.04; // 40 meters
const MIN_VALIDATION_TIME = 15 * 60 * 1000; // 15 minutes

const validateStore = {
  schema: {
    summary: "User validate store",
    tags: ["store"],
    params: S.object().prop("id", S.integer().required()),
    body: S.object()
      .prop("longitude", S.number().required())
      .prop("latitude", S.number().required()),
    response: {
      200: S.object().prop("reputation", S.integer()),
      404: S.object().prop("error", S.string()),
      422: S.object().prop("error", S.string()),
      429: S.object().prop("error", S.string()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { id } = req.params;
    const { longitude, latitude } = req.body;

    const repoStore = req.server.db.getRepository(Store);
    const store = await repoStore.findOne({
      where: { id },
      relations: {
        revisions: {
          user: true,
          contribution: true,
        },
        validations: {
          user: true,
        },
      },
    });

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    const distance = getCoordinatesDistance(store, req.body);
    if (distance > MAX_VALIDATION_DISTANCE) {
      return reply.status(422).send({ error: "store.validation.position" });
    }

    const alreadyValidated = (store.validations || []).some(
      ({ user }) => user.id === req.user.id
    );
    if (alreadyValidated) {
      return reply.status(422).send({ error: "store.validation.already" });
    }

    const recentValidation = req.user.contributions.some(
      ({ reason, createdAt }) =>
        reason === "store.validation.creation" &&
        createdAt > Date.now() - MIN_VALIDATION_TIME
    );
    if (recentValidation) {
      return reply.status(429).send({ error: "store.validation.ratelimit" });
    }

    // Reward all contributors
    const contributors = store.revisions.reduce((contributors, revision) => {
      if (revision.user.id === req.user.id) {
        return contributors;
      }
      if (!contributors[revision.user.id]) {
        contributors[revision.user.id] = 0;
      }
      contributors[revision.user.id] += revision.contribution.reputation;
      return contributors;
    }, {});

    await Promise.all(
      Object.entries(contributors).map(([user, reputation]) => {
        return req.server.db.manager.save(Contribution, {
          user,
          reputation: Math.floor(reputation / 4) || 1,
          reason: "store.validation.reward",
        });
      })
    );

    // Save validation and reward user
    const repoValidation = req.server.db.getRepository(StoreValidation);
    await repoValidation.save({
      longitude,
      latitude,
      user: req.user.id,
      contribution: {
        user: req.user.id,
        reputation: REPUTATIONS.STORE.VALIDATION,
        reason: "store.validation.creation",
      },
      store: store.id,
    });

    return { reputation: REPUTATIONS.STORE.VALIDATION };
  },
};

module.exports = {
  getAllStores,
  getStore,
  createStore,
  updateStore,
  validateStore,
};
