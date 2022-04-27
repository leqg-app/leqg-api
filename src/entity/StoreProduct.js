const { EntitySchema } = require("typeorm");

const StoreProduct = new EntitySchema({
  name: "StoreProduct",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    productName: {
      type: "varchar",
      nullable: true,
    },
    price: {
      type: "float",
      nullable: true, // TO REMOVE
    },
    specialPrice: {
      type: "float",
      nullable: true,
    },
    volume: {
      type: "int",
      nullable: true, // TO REMOVE
    },
    type: {
      type: "varchar",
      // enum: ["draft", "bottle", "can", "other"],
      nullable: true, // TO REMOVE
    },
    currencyCode: {
      type: "varchar",
      length: 3,
      default: "EUR",
    },
    productId: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    store: {
      type: "many-to-one",
      target: "Store",
      inverseSide: "products",
    },
    product: {
      type: "many-to-one",
      target: "Product",
      inverseSide: "stores",
      joinColumn: "productId",
    },
  },
});

module.exports = {
  StoreProduct,
};
