const entities = require("../../../src/entity/index.js");

module.exports.Product = {
  repository: entities.Product,
  data: [
    {
      name: "Heineken",
      type: "beer",
      custom: {},
    },
    {
      name: "Leffe",
      type: "beer",
      custom: {},
    },
    {
      name: "La Chouffe",
      type: "beer",
      custom: {},
    },
  ],
};
