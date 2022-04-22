import { EntitySchema } from "typeorm";

export const Version = new EntitySchema({
  name: "Version",
  columns: {
    name: {
      type: "varchar",
      primary: true,
      unique: true,
    },
    version: {
      type: "int",
    },
  },
});
