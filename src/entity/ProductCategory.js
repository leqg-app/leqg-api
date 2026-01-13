const { EntitySchema } = require("typeorm");

const ProductCategory = new EntitySchema({
  name: "ProductCategory",
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
  },
  relations: {
    products: {
      type: "one-to-many",
      target: "Product",
      inverseSide: "productCategory",
      eager: true,
    },
  },
});

module.exports = {
  ProductCategory,
};
