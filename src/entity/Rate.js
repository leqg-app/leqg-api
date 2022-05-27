const { EntitySchema } = require("typeorm");

const Rate = new EntitySchema({
  name: "Rate",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    rate1: {
      type: "double",
    },
    rate2: {
      type: "double",
    },
    rate3: {
      type: "double",
    },
    comment: {
      type: "text",
    },
    createdAt: {
      createDate: true,
    },
    updatedAt: {
      updateDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
    },
    store: {
      type: "many-to-one",
      target: "Store",
      inverseSide: "rates",
    },
    recommendedProducts: {
      type: "many-to-many",
      target: "StoreProduct",
    },
    contribution: {
      type: "one-to-one",
      target: "Contribution",
      inverseSide: "rate",
      joinColumn: true,
      cascade: ["insert"],
    },
  },
});

module.exports = {
  Rate,
};
