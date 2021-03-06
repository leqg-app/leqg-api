const { EntitySchema } = require("typeorm");

const Contribution = new EntitySchema({
  name: "Contribution",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    reputation: {
      type: "int",
      default: 0,
    },
    reason: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "contributions",
    },
    rate: {
      type: "one-to-one",
      target: "Rate",
      inverseSide: "contribution",
    },
    revision: {
      type: "one-to-one",
      target: "StoreRevision",
      inverseSide: "contribution",
    },
    validation: {
      type: "one-to-one",
      target: "StoreValidation",
      inverseSide: "contribution",
    },
  },
});

module.exports = {
  Contribution,
};
