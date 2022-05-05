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
    updatedAt: {
      updateDate: true,
    },
  },
});

module.exports = {
  Version,
};
