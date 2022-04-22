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
      type: "longtext",
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
