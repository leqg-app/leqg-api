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
      type: "decimal",
      precision: 3,
      scale: 2,
    },
    rate2: {
      type: "decimal",
      precision: 3,
      scale: 2,
    },
    rate3: {
      type: "decimal",
      precision: 3,
      scale: 2,
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
      onDelete: "SET NULL",
    },
    store: {
      type: "many-to-one",
      target: "Store",
      inverseSide: "rates",
      onDelete: "CASCADE",
    },
    recommendedProducts: {
      type: "many-to-many",
      target: "StoreProduct",
      joinTable: true,
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
