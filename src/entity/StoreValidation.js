const { EntitySchema } = require("typeorm");

const StoreValidation = new EntitySchema({
  name: "StoreValidation",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    latitude: {
      type: "double",
    },
    longitude: {
      type: "double",
    },
    createdAt: {
      createDate: true,
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
      inverseSide: "validations",
      onDelete: "SET NULL",
    },
    contribution: {
      type: "one-to-one",
      target: "Contribution",
      inverseSide: "validation",
      joinColumn: true,
      cascade: ["insert"],
    },
  },
});

module.exports = {
  StoreValidation,
};
