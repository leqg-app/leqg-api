const { EntitySchema } = require("typeorm");

const Version = new EntitySchema({
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
    count: {
      type: "int",
      default: 0,
    },
    updatedAt: {
      updateDate: true,
    },
  },
});

module.exports = {
  Version,
};
