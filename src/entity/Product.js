import { EntitySchema } from "typeorm";

export const Product = new EntitySchema({
  name: "Product",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      unique: true,
    },
    type: {
      type: "varchar",
      // enum: ["beer", "cider"],
      // default: "beer",
    },
    custom: {
      type: "simple-json",
      nullable: true,
    },
  },
  relations: {
    store: {
      type: "one-to-many",
      target: "StoreProduct",
      inverseSide: "product",
    },
  },
});
