import * as version from "./handlers/version.js";
import * as stores from "./handlers/stores.js";
import * as products from "./handlers/products.js";
import * as features from "./handlers/features.js";

async function v1(fastify) {
  fastify.get("/version", version.getAllVersions);

  fastify.get("/stores", stores.getAllStores);
  fastify.get("/stores/:id", stores.getAllStores);
  fastify.post("/stores", stores.getAllStores);
  fastify.put("/stores", stores.getAllStores);

  fastify.get("/products", products.getAllProducts);

  fastify.get("/features", features.getAllFeatures);
}

export default v1;
