import { EntitySchema } from "typeorm";

export const CurrencyRate = new EntitySchema({
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
