const version = require("./handlers/version.js");
const stores = require("./handlers/stores.js");
const products = require("./handlers/products.js");
const features = require("./handlers/features.js");
const auth = require("./handlers/auth.js");
const user = require("./handlers/user.js");
const currencies = require("./handlers/currencies.js");

const { userSchema } = require("./schemas/user.js");
const { errorSchema } = require("./schemas/error.js");
const { productSchema } = require("./schemas/product.js");
const { storeSchema } = require("./schemas/store.js");
const { currencyRateSchema } = require("./schemas/currencyRate.js");

module.exports = async function routes(fastify) {
  fastify.register(userSchema);
  fastify.register(errorSchema);
  fastify.register(productSchema);
  fastify.register(storeSchema);
  fastify.register(currencyRateSchema);

  fastify.register(v1, { prefix: "v1" });
  fastify.register(authRoutes);
};

async function v1(fastify) {
  fastify.get("/version", version.getAllVersions);

  fastify.get("/stores", stores.getAllStores);
  fastify.get("/stores/:id", stores.getStore);
  fastify.post("/stores", stores.createStore);
  fastify.put("/stores/:id", stores.updateStore);

  fastify.get("/products", products.getAllProducts);
  fastify.post("/products", products.createProduct);

  fastify.get("/currencies", currencies.getAllCurrencies);

  fastify.get("/features", features.getAllFeatures);
}

async function authRoutes(fastify) {
  fastify.post("/auth/local", auth.login);
  fastify.post("/auth/local/register", auth.register);
  fastify.post("/auth/forgot-password", auth.forgotPassword);
  fastify.post("/auth/reset-password", auth.resetPassword);

  fastify.get("/users/me", user.getProfile);
  fastify.put("/users/me", user.updateProfile);
}
