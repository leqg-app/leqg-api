const stores = require("./handlers/stores.js");
const user = require("./handlers/user.js");
const auth = require("./handlers/auth.js");

const { storeSchema } = require("./schemas/store.js");
const { errorSchema } = require("./schemas/error.js");
const { reputationSchema } = require("./schemas/reputation.js");
const { userSchema } = require("./schemas/user.js");

module.exports = async function routes(fastify) {
  storeSchema(fastify);
  errorSchema(fastify);
  reputationSchema(fastify);
  userSchema(fastify);

  fastify.register(v2, { prefix: "v2" });
};

async function v2(fastify) {
  fastify.get("/stores", stores.getAllStores);
  fastify.get("/stores/versions/:current..:next", stores.getStoresVersion);
  fastify.get("/stores/:id", stores.getStore);
  fastify.post("/stores", stores.createStore);
  fastify.put("/stores/:id", stores.updateStore);
  fastify.delete("/stores/:id", stores.deleteStore);
  fastify.post("/stores/:id/validate", stores.validateStore);
  fastify.post("/stores/:id/rate", stores.rateStore);

  fastify.post("/auth/local", auth.login);
  fastify.post("/auth/local/register", auth.register);
  fastify.post("/auth/forgot-password", auth.forgotPassword);
  fastify.post("/auth/reset-password", auth.resetPassword);
  fastify.post("/auth/:provider/register", auth.providerRegister);
  fastify.get("/auth/:provider/callback", auth.providerCallback);

  fastify.get("/users/me", user.getProfile);
  fastify.get("/users/me/contributions", user.getContributions);
  fastify.put("/users/me", user.updateProfile);
  fastify.delete("/users/me", user.deleteProfile);
}
