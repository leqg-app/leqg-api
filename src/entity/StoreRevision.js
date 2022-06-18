const { EntitySchema } = require("typeorm");

const StoreRevision = new EntitySchema({
  name: "StoreRevision",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    version: {
      type: "int",
    },
    changes: {
      type: "text",
      transformer: {
        from: (string) => JSON.parse(string || null),
        to: (string) => JSON.stringify(string || ""),
      },
    },
    createdAt: {
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      inverseSide: "revisions",
    },
    store: {
      type: "many-to-one",
      target: "Store",
      inverseSide: "revisions",
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
  StoreRevision,
};
