const S = require("fluent-json-schema");

const { Product } = require("../../entity/Product.js");

const getAllProducts = {
  schema: {
    summary: "Get all products",
    tags: ["product"],
    response: {
      200: S.array().items(S.ref("productSchema")),
    },
  },
  handler: async (req, rep) => {
    const repo = rep.server.db.getRepository(Product);
    return repo.find();
  },
};

const createProduct = {
  schema: {
    summary: "Create a product",
    tags: ["product"],
    body: S.ref("productBaseSchema"),
    response: {
      200: S.ref("productSchema"),
    },
  },
  preHandler: async () => {
    // TODO
    // Only admin at the moment
  },
  handler: async () => {
    // TODO
  },
};

module.exports = { getAllProducts, createProduct };
