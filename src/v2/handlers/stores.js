const S = require("fluent-json-schema");

const { Store } = require("../../entity/Store.js");
const { formatStores } = require("../utils/format.js");

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

module.exports = {
  getAllStores,
};
