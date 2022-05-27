const { EntitySchema } = require("typeorm");

const Store = new EntitySchema({
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
    rate: {
      type: "double",
      default: null,
    },
    rateCount: {
      type: "integer",
      default: 0,
    },
    createdAt: {
      createDate: true,
    },
    updatedAt: {
      updateDate: true,
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
    rates: {
      type: "one-to-many",
      target: "Rate",
      inverseSide: "store",
      eager: true,
    },
    revisions: {
      type: "one-to-many",
      target: "StoreRevision",
      inverseSide: "store",
      eager: true,
    },
    validations: {
      type: "one-to-many",
      target: "StoreValidation",
      inverseSide: "store",
      eager: true,
    },
  },
});

module.exports = {
  Store,
};
