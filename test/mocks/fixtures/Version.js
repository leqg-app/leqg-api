const entities = require("../../../src/entity/index.js");

module.exports.Version = {
  repository: entities.Version,
  data: [
    {
      name: "stores",
      version: 1,
    },
    {
      name: "products",
      version: 1,
    },
    {
      name: "rates",
      version: 1,
    },
    {
      name: "features",
      version: 1,
    },
  ],
};
