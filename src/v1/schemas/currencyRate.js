import fastifyPlugin from "fastify-plugin";
import S from "fluent-json-schema";

const currencyRateSchema = fastifyPlugin(async function (fastify) {
  const currencyRate = S.object()
    .id("currencyRateSchema")
    .prop("code", S.string())
    .prop("rate", S.number());
  fastify.addSchema(currencyRate);
});

export { currencyRateSchema };
