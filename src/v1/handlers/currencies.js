const S = require("fluent-json-schema");

const { CurrencyRate } = require("../../entity/CurrencyRate.js");

const getAllCurrencies = {
  schema: {
    summary: "Get all currencies rates",
    tags: ["currency"],
    response: {
      200: S.array().items(S.ref("currencyRateSchema")),
    },
  },
  handler: async (req, rep) => {
    const repo = rep.server.db.getRepository(CurrencyRate);
    return repo.find();
  },
};

module.exports = { getAllCurrencies };
