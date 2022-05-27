const entities = require("../../../src/entity/index.js");

module.exports.Store = {
  repository: entities.Store,
  data: [
    {
      name: "Store 1",
      address: "Address 1",
      longitude: 1.0,
      latitude: 1.0,
      products: [
        {
          productId: 1,
          price: 5,
          volume: 50,
          type: "draft",
        },
        {
          productId: 2,
          price: 2,
          volume: 50,
          type: "draft",
        },
        {
          productId: null,
          productName: "Bière",
          price: 3.9,
          volume: 50,
          type: "draft",
        },
      ],
      schedules: Array(7)
        .fill(0)
        .map((_, i) => ({
          dayOfWeek: i + 1,
          closed: false,
        })),
      features: [1],
    },
    {
      name: "Store 2",
      address: "Address 2",
      longitude: 1,
      latitude: 1,
      products: [
        {
          productId: 1,
          price: 1,
          volume: 50,
          type: "draft",
        },
      ],
    },
  ],
};
