const { EntitySchema } = require("typeorm");

const CurrencyRate = new EntitySchema({
  name: "CurrencyRate",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    code: {
      type: "varchar",
      unique: true,
    },
    rate: {
      type: "float",
    },
  },
});

module.exports = {
  CurrencyRate,
};
