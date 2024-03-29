const S = require("fluent-json-schema");
const { Between } = require("typeorm");

const {
  StoreRevision,
  Version,
  Contribution,
  StoreValidation,
  Rate,
} = require("../../entity/index.js");
const { Store, getStores, getOneStore } = require("../../entity/Store.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");
const { formatStores } = require("../utils/format.js");
const diffMapper = require("../../v1/utils/diffMapper.js");
const { getCoordinatesDistance } = require("../../v1/utils/coordinates.js");
const { calculateReputation } = require("../../v1/utils/reputation.js");
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
    const stores = await getStores(req.server.db);
    return stores.map(formatStores);
  },
};

const getStoresVersion = {
  schema: {
    summary: "Get all stores between two versions",
    tags: ["store"],
    params: S.object()
      .prop("current", S.integer().required())
      .prop("next", S.integer().required()),
    response: {
      200: S.object()
        .prop("updated", S.array().items(S.ref("storeMinified")))
        .prop("deleted", S.array().items(S.integer())),
    },
  },
  handler: async (req) => {
    const { current, next } = req.params;
    const revisions = await req.server.db.manager.find(StoreRevision, {
      where: {
        version: Between(current + 1, next), // don't include curent version
      },
      relations: {
        store: {
          schedules: true,
          products: true,
          features: true,
        },
      },
    });

    // Display stores only once
    const updated = {};
    const deleted = [];
    for (const revision of revisions) {
      const deletion = revision.changes.find(
        (change) => change.type === "deleted" && change.field === "id"
      );
      if (deletion) {
        deleted.push(deletion.delta);
        continue;
      }
      if (!revision.store) {
        continue;
      }
      updated[revision.store.id] = revision.store;
    }

    return {
      updated: Object.values(updated).map(formatStores),
      deleted,
    };
  },
};

const getStore = {
  schema: {
    summary: "Get a store",
    tags: ["store"],
    params: S.object().prop("id", S.integer().required()),
    response: {
      200: S.ref("storeSchema"),
      404: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { id } = req.params;
    const store = await getOneStore(req, id);

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    return store;
  },
};

const createStore = {
  schema: {
    summary: "Create a store",
    tags: ["store"],
    body: S.ref("storeBaseSchema"),
    response: {
      200: S.object()
        .prop("store", S.ref("storeSchema"))
        .prop("reputation", S.ref("reputationSchema"))
        .prop("version", S.integer()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req) => {
    const repoStore = req.server.db.getRepository(Store);
    const store = await repoStore.save(req.body);

    const repoVersion = req.server.db.getRepository(Version);
    let { version } = await repoVersion.findOneBy({ name: "stores" });

    const changes = diffMapper({}, store, STORE_REVISION_FIELDS);
    const reputation = calculateReputation([], changes, req.user.id);
    reputation.reason = "store.creation";

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

    // Set new revision into store response
    delete revision.store;
    revision.user = { username: req.user.username };

    store.revisions = [revision];

    // Upgrade version
    const count = await repoStore.count();
    await repoVersion.update({ name: "stores" }, { version, count });

    const created = await getOneStore(req, store.id);
    return {
      store: created,
      reputation,
      version,
    };
  },
};

const updateStore = {
  schema: {
    summary: "Update store",
    tags: ["store"],
    query: S.object().prop("contribution", S.string()),
    params: S.object().prop("id", S.integer().required()),
    body: S.ref("storeBaseSchema"),
    response: {
      200: S.object()
        .prop("store", S.ref("storeSchema"))
        .prop("reputation", S.ref("reputationSchema"))
        .prop("version", S.integer()),
      404: S.ref("errorSchema"),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { id } = req.params;
    const repoStore = req.server.db.getRepository(Store);
    const store = await getOneStore(req, id);

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    req.body.id = id;
    await repoStore.save(req.body);

    const repoVersion = req.server.db.getRepository(Version);
    let { version } = await repoVersion.findOneBy({ name: "stores" });

    const updated = await getOneStore(req, id);
    const changes = diffMapper(store, updated, STORE_REVISION_FIELDS);

    if (!changes.length) {
      return {
        store,
        reputation: {
          total: 0,
          fields: [],
        },
        version,
      };
    }

    // Upgrade version
    await repoVersion.update({ name: "stores" }, { version: ++version });

    if (req.query.contribution === "false") {
      return {
        store,
        reputation: {
          total: 0,
          fields: [],
        },
        version,
      };
    }

    // Calculate new reputation
    const reputation = calculateReputation(
      store.revisions,
      changes,
      req.user.id
    );
    reputation.reason = "store.edition";

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
      store: updated,
      reputation,
      version,
    };
  },
};

const deleteStore = {
  schema: {
    summary: "Delete store",
    tags: ["store"],
    params: S.object().prop("id", S.integer().required()),
    response: {
      200: S.object().prop("version", S.integer()),
      404: S.ref("errorSchema"),
    },
  },
  onRequest: [isRole(ROLES.ADMIN)],
  handler: async (req, reply) => {
    const { id } = req.params;
    const repoStore = req.server.db.getRepository(Store);
    const store = await getOneStore(req, id);

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    await repoStore.delete(id);

    const repoVersion = req.server.db.getRepository(Version);
    let { version } = await repoVersion.findOneBy({ name: "stores" });

    const changes = diffMapper(store, {}, ["id", ...STORE_REVISION_FIELDS]);

    // Upgrade version
    const count = await repoStore.count();
    await repoVersion.update({ name: "stores" }, { version: ++version, count });

    // Create revision
    await req.server.db.manager.save(StoreRevision, {
      user: req.user.id,
      version,
      changes,
      contribution: {
        user: req.user.id,
        reputation: 0,
        reason: "store.deletion",
      },
    });

    return { version };
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
      200: S.object().prop("reputation", S.ref("reputationSchema")),
      404: S.object().prop("error", S.string()),
      422: S.object().prop("error", S.string()),
      429: S.object().prop("error", S.string()),
    },
  },
  onRequest: [isRole(ROLES.USER, { relations: ["contributions"] })],
  handler: async (req, reply) => {
    const { id } = req.params;
    const { longitude, latitude } = req.body;

    const store = await req.server.db.manager.findOne(Store, {
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

    return {
      reputation: {
        total: REPUTATIONS.STORE.VALIDATION,
        reason: "store.validation.creation",
      },
    };
  },
};

const rateStore = {
  schema: {
    summary: "User rate store",
    tags: ["store"],
    params: S.object().prop("id", S.integer().required()),
    body: S.object()
      .prop("rate1", S.number().required())
      .prop("rate2", S.number().required())
      .prop("rate3", S.number().required())
      .prop("comment", S.string())
      .prop("recommendedProducts", S.array().items(S.integer())),
    response: {
      200: S.object()
        .prop("store", S.ref("storeSchema"))
        .prop("reputation", S.ref("reputationSchema"))
        .prop("version", S.integer()),
      400: S.object().prop("error", S.string()),
      404: S.object().prop("error", S.string()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { id } = req.params;
    const { rate1, rate2, rate3, comment, recommendedProducts } = req.body;

    const repoStore = req.server.db.getRepository(Store);
    const store = await repoStore.findOne({
      where: { id },
      relations: { rates: { user: true } },
    });
    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    const alreadyRated = store.rates.some(
      (rate) => rate.user.id === req.user.id
    );
    if (alreadyRated) {
      return reply.status(400).send({ error: "store.rate.duplicate" });
    }

    const fields = [
      {
        fieldName: "rate",
        reputation: REPUTATIONS.STORE.RATE,
      },
    ];
    if (comment) {
      fields.push({
        fieldName: "comment",
        reputation: REPUTATIONS.STORE.COMMENT,
      });
      if (comment.length > 20) {
        fields.push({
          fieldName: "longComment",
          reputation: REPUTATIONS.STORE.LONG_COMMENT,
        });
      }
    }

    if (recommendedProducts.length) {
      fields.push(
        ...recommendedProducts.map(() => ({
          fieldName: "recommendedProduct",
          reputation: REPUTATIONS.STORE.RECOMMENDED_PRODUCT,
        }))
      );
    }

    const rate = (rate1 + rate2 + rate3) / 3;
    store.rate = (store.rate * store.rateCount + rate) / ++store.rateCount;

    await repoStore.save(store);

    const reputation = fields.reduce((rep, field) => rep + field.reputation, 0);

    // Save validation and reward user
    await req.server.db.manager.save(Rate, {
      ...req.body,
      user: req.user.id,
      contribution: {
        user: req.user.id,
        reputation,
        reason: "store.rate.creation",
      },
      store: store.id,
    });

    const repoVersion = req.server.db.getRepository(Version);
    let { version } = await repoVersion.findOneBy({ name: "stores" });
    await repoVersion.update({ name: "stores" }, { version: ++version });

    return {
      store: await getOneStore(req, store.id),
      reputation: {
        total: reputation,
        reason: "store.rate.creation",
        fields,
      },
      version,
    };
  },
};

module.exports = {
  getAllStores,
  getStore,
  getStoresVersion,
  createStore,
  updateStore,
  deleteStore,
  validateStore,
  rateStore,
};
