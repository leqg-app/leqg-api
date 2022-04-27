const fastifyPlugin = require("fastify-plugin");
const S = require("fluent-json-schema");

const currencyRateSchema = fastifyPlugin(async function (fastify) {
  const currencyRate = S.object()
    .id("currencyRateSchema")
    .prop("code", S.string())
    .prop("rate", S.number());
  fastify.addSchema(currencyRate);
});

module.exports = { currencyRateSchema };
