import S from "fluent-json-schema";

import { CurrencyRate } from "../../entity/CurrencyRate.js";

const getAllCurrencies = {
  schema: {
    summary: "Get all currencies rates",
    response: {
      200: S.array().items(S.ref("currencyRateSchema")),
    },
  },
  handler: async (req, rep) => {
    const repo = rep.server.db.getRepository(CurrencyRate);
    return repo.find();
  },
};

export { getAllCurrencies };
