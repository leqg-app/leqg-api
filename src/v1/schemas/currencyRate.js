const S = require("fluent-json-schema");

const currencyRateSchema = function (fastify) {
  const currencyRate = S.object()
    .id("currencyRateSchema")
    .prop("code", S.string())
    .prop("rate", S.number());
  fastify.addSchema(currencyRate);
};

module.exports = { currencyRateSchema };
