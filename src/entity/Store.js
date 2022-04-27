import { EntitySchema } from "typeorm";

export const Store = new EntitySchema({
  name: "Store",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
    latitude: {
      type: "double",
    },
    longitude: {
      type: "double",
    },
    address: {
      type: "varchar",
    },
    phone: {
      type: "varchar",
      default: null,
    },
    website: {
      type: "varchar",
      default: null,
    },
    googlePlaceId: {
      type: "varchar",
      default: null,
    },
    googleDataId: {
      type: "varchar",
      default: null,
    },
    countryCode: {
      type: "varchar",
      nullable: true,
      default: "FR",
    },
  },
  relations: {
    schedules: {
      type: "one-to-many",
      target: "Schedule",
      inverseSide: "store",
      cascade: ["insert", "remove", "update"],
      eager: true,
    },
    products: {
      type: "one-to-many",
      target: "StoreProduct",
      inverseSide: "store",
      cascade: ["insert", "remove", "update"],
      eager: true,
    },
    features: {
      type: "many-to-many",
      target: "Feature",
      joinTable: true,
      eager: true,
    },
    revisions: {
      type: "one-to-many",
      target: "StoreRevision",
      inverseSide: "store",
      eager: true,
    },
  },
});
