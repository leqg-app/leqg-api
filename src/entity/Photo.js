const { EntitySchema } = require("typeorm");

const Photo = new EntitySchema({
  name: "Photo",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    url: {
      type: "varchar",
    },
    caption: {
      type: "varchar",
      nullable: true,
      default: null,
    },
    createdAt: {
      createDate: true,
    },
    updatedAt: {
      updateDate: true,
    },
  },
  relations: {
    store: {
      type: "many-to-one",
      target: "Store",
      inverseSide: "photos",
      onDelete: "CASCADE",
    },
    user: {
      type: "many-to-one",
      target: "User",
    },
    product: {
      type: "many-to-one",
      target: "Product",
      nullable: true,
    },
  },
});

module.exports = {
  Photo,
};
