const S = require("fluent-json-schema");

const { Store } = require("../../entity/Store.js");
const { StoreRevision } = require("../../entity/StoreRevision.js");
const { Version } = require("../../entity/Version.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");
const {
  formatStore,
  formatStores,
  formatSchedules,
} = require("../utils/format.js");
const diffMapper = require("../utils/diffMapper.js");
const { calculateReputation } = require("../utils/reputation.js");

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
    formatSchedules(req.body.schedules);

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
    formatSchedules(req.body.schedules);

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

module.exports = {
  getAllStores,
  getStore,
  createStore,
  updateStore,
};
