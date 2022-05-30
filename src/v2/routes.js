const stores = require("./handlers/stores.js");

const { storeSchema } = require("./schemas/store.js");
const { errorSchema } = require("./schemas/error.js");
const { reputationSchema } = require("./schemas/reputation.js");

module.exports = async function routes(fastify) {
  storeSchema(fastify);
  errorSchema(fastify);
  reputationSchema(fastify);

  fastify.register(v2, { prefix: "v2" });
};

async function v2(fastify) {
  fastify.get("/stores", stores.getAllStores);
  fastify.get("/stores/:id", stores.getStore);
  fastify.post("/stores", stores.createStore);
  fastify.put("/stores/:id", stores.updateStore);
  fastify.post("/stores/:id/validate", stores.validateStore);
  fastify.post("/stores/:id/rate", stores.rateStore);
}
