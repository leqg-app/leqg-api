import { EntitySchema } from "typeorm";

export const StoreRevision = new EntitySchema({
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
    },
  },
});
