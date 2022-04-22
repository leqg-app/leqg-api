import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    username: {
      type: "varchar",
      unique: true,
    },
    email: {
      type: "varchar",
    },
    provider: {
      type: "varchar",
    },
    password: {
      type: "varchar",
    },
    resetPasswordToken: {
      type: "varchar",
      nullable: true,
    },
    confirmationToken: {
      type: "varchar",
      nullable: true,
    },
    confirmed: {
      type: "boolean",
      default: false,
    },
    blocked: {
      type: "boolean",
      nullable: true,
      default: false,
    },
    role: {
      type: "int",
    },
    contributions: {
      type: "int",
      nullable: true,
      default: 0,
    },
  },
  relations: {
    favorites: {
      type: "many-to-many",
      target: "Store",
      joinTable: true,
      eager: true,
    },
    revisions: {
      type: "one-to-many",
      target: "StoreRevision",
      inverseSide: "user",
    },
  },
});
