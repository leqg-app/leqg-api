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
      type: "decimal",
      precision: 8,
      scale: 5,
    },
    longitude: {
      type: "decimal",
      precision: 8,
      scale: 5,
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
      type: "decimal",
      precision: 3,
      scale: 2,
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
      cascade: ["insert", "update", "remove"],
    },
    products: {
      type: "one-to-many",
      target: "StoreProduct",
      inverseSide: "store",
      cascade: ["insert", "update", "remove"],
    },
    features: {
      type: "many-to-many",
      target: "Feature",
      joinTable: true,
    },
    rates: {
      type: "one-to-many",
      target: "Rate",
      inverseSide: "store",
    },
    revisions: {
      type: "one-to-many",
      target: "StoreRevision",
      inverseSide: "store",
    },
    validations: {
      type: "one-to-many",
      target: "StoreValidation",
      inverseSide: "store",
    },
  },
});

async function getStores(db) {
  const stores = await db.manager.find(Store);
  const schedules = await db.manager.query(`SELECT * FROM schedule`);
  const storeProducts = await db.manager.query(`SELECT * FROM store_product`);
  const features = await db.manager.query(
    `SELECT * FROM store_features_feature`
  );

  const scheduleByStoreId = {};
  for (const schedule of schedules) {
    if (!scheduleByStoreId[schedule.storeId]) {
      scheduleByStoreId[schedule.storeId] = [];
    }
    scheduleByStoreId[schedule.storeId].push(schedule);
  }
  const storeProductsByStoreId = {};
  for (const storeProduct of storeProducts) {
    if (!storeProductsByStoreId[storeProduct.storeId]) {
      storeProductsByStoreId[storeProduct.storeId] = [];
    }
    storeProductsByStoreId[storeProduct.storeId].push(storeProduct);
  }
  const featuresByStoreId = {};
  for (const feature of features) {
    if (!featuresByStoreId[feature.storeId]) {
      featuresByStoreId[feature.storeId] = [];
    }
    featuresByStoreId[feature.storeId].push({ id: feature.featureId });
  }

  for (const store of stores) {
    store.schedules = scheduleByStoreId[store.id] || [];
    store.products = storeProductsByStoreId[store.id] || [];
    store.features = featuresByStoreId[store.id] || [];
  }

  return stores;
}

function getOneStore(req, id) {
  return req.server.db.manager.findOne(Store, {
    where: { id },
    relations: {
      schedules: true,
      products: true,
      features: true,
      rates: { user: true, recommendedProducts: true },
      revisions: { user: true },
      validations: { user: true },
    },
  });
}

module.exports = {
  Store,
  getStores,
  getOneStore,
};
