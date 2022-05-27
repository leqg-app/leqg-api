const stores = require("./handlers/stores.js");

const { storeSchema } = require("./schemas/store.js");

module.exports = async function routes(fastify) {
  fastify.register(storeSchema);

  fastify.register(v2, { prefix: "v2" });
};

async function v2(fastify) {
  fastify.get("/stores", stores.getAllStores);
}
