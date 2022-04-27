const S = require("fluent-json-schema");

const { Store } = require("../../entity/Store.js");
const { StoreRevision } = require("../../entity/StoreRevision.js");
const { Version } = require("../../entity/Version.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");
const formatStore = require("../utils/format.js");
const diffMapper = require("../utils/diffMapper.js");

const getAllStores = {
  schema: {
    summary: "Get all stores",
    response: {
      200: S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("name", S.string())
          .prop("lng", S.number())
          .prop("lat", S.number())
          .prop("price", S.number())
          .prop("currency", S.string())
          .prop("specialPrice", S.number())
          .prop("products", S.array().items(S.integer()))
          .prop(
            "s",
            S.array().items(
              S.object()
                .prop("cd", S.boolean())
                .prop("o", S.integer())
                .prop("c", S.integer())
                .prop("os", S.integer())
                .prop("cs", S.integer())
            )
          )
          .prop("f", S.array().items(S.integer()))
      ),
    },
  },
  handler: async (req) => {
    const storeRepo = req.server.db.getRepository(Store);
    const stores = await storeRepo.find();
    return stores.map(formatStore);
  },
};

const getStore = {
  schema: {
    summary: "Get a store",
    params: S.object().prop("id", S.integer().required()),
    response: {
      200: S.ref("storeSchema"),
    },
  },
  handler: async (req) => {
    const { id } = req.params;
    const storeRepo = req.server.db.getRepository(Store);
    const store = await storeRepo.findOneBy({ id });
    store.features = store.features.map(({ id }) => id);
    store.products.map((p) => (p.product = p.productId));
    return store;
  },
};

const createStore = {
  schema: {
    summary: "Create a store",
    body: S.ref("storeBaseSchema"),
    response: {
      200: S.ref("storeSchema"),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, rep) => {
    const repoStore = req.server.db.getRepository(Store);
    const store = await repoStore.save(req.body);

    const repoVersion = req.server.db.getRepository(Version);
    const { version } = await repoVersion.findOneBy({ name: "stores" });

    // Create revision
    const revision = await req.server.db.manager.save(StoreRevision, {
      store,
      version: version + 1,
      author: req.user.id,
      changes: [{ type: "initial" }],
    });

    // Set revision into store response
    delete revision.store;
    revision.user = { username: "nicolas" };

    store.revisions = [revision];

    // Upgrade version
    await repoVersion.update({ name: "stores" }, { version: version + 1 });

    return store;
  },
};

const updateStore = {
  schema: {
    summary: "Update store",
    params: S.object().prop("id", S.integer().required()),
    body: S.ref("storeSchema"),
    response: {
      200: S.object()
        .prop("store", S.ref("storeSchema"))
        .prop("contributed", S.boolean()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { id } = req.params;
    const repoStore = req.server.db.getRepository(Store);
    const store = await repoStore.findOneBy({ id });

    if (!store) {
      return reply.status(404).send({});
    }

    const updated = await repoStore.save(req.body);

    const changes = diffMapper(store, updated);

    if (!changes.length) {
      return {
        store: updated,
        contributed: false,
      };
    }

    const repoVersion = req.server.db.getRepository(Version);
    const { version } = await repoVersion.findOneBy({ name: "stores" });

    // Create revision
    const revision = await req.server.db.manager.save(StoreRevision, {
      store,
      version: version + 1,
      author: req.user.id,
      changes,
    });

    // Upgrade version
    await repoVersion.update({ name: "stores" }, { version: version + 1 });

    updated.revisions.push(revision);

    return { store: updated, contributed: true };
  },
};

module.exports = { getAllStores, getStore, createStore, updateStore };
