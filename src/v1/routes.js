import * as version from "./handlers/version.js";
import * as stores from "./handlers/stores.js";
import * as products from "./handlers/products.js";
import * as features from "./handlers/features.js";
import * as auth from "./handlers/auth.js";
import * as user from "./handlers/user.js";

import { userSchema } from "./schemas/user.js";
import { errorSchema } from "./schemas/error.js";

export default async function routes(fastify) {
  fastify.register(userSchema);
  fastify.register(errorSchema);

  fastify.register(v1, { prefix: "v1" });
  fastify.register(authRoutes);
}

async function v1(fastify) {
  fastify.get("/version", version.getAllVersions);

  fastify.get("/stores", stores.getAllStores);
  fastify.get("/stores/:id", stores.getAllStores);
  fastify.post("/stores", stores.getAllStores);
  fastify.put("/stores", stores.getAllStores);

  fastify.get("/products", products.getAllProducts);

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
