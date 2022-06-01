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
      schedules: [
        {
          dayOfWeek: 1,
          closed: true,
        },
        {
          dayOfWeek: 2,
          closed: true,
        },
        {
          dayOfWeek: 3,
          closed: false,
          opening: 200,
          closing: 400,
          openingSpecial: 200,
          closingSpecial: 400,
        },
        {
          dayOfWeek: 4,
          closed: false,
          openingSpecial: 200,
          closingSpecial: 400,
        },
        {
          dayOfWeek: 5,
          closed: false,
        },
        {
          dayOfWeek: 6,
          closed: false,
        },
        {
          dayOfWeek: 7,
          closed: false,
        },
      ],
      features: [
        {
          id: 1,
        },
      ],
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
