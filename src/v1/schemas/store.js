const fastifyPlugin = require("fastify-plugin");
const S = require("fluent-json-schema");

const storeSchema = fastifyPlugin(async function (fastify) {
  const storeBaseSchema = S.object()
    .id("storeBaseSchema")
    .prop("name", S.string().required())
    .prop("latitude", S.number().required())
    .prop("longitude", S.number().required())
    .prop("address", S.string().required())
    .prop("phone", S.anyOf([S.null(), S.string()]))
    .prop("website", S.anyOf([S.null(), S.string()]))
    .prop("countryCode", S.string())
    .prop(
      "schedules",
      S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("dayOfWeek", S.integer())
          .prop("opening", S.anyOf([S.null(), S.integer()]))
          .prop("closing", S.anyOf([S.null(), S.integer()]))
          .prop("openingSpecial", S.anyOf([S.null(), S.integer()]))
          .prop("closingSpecial", S.anyOf([S.null(), S.integer()]))
          .prop("closed", S.boolean())
      )
    )
    .prop(
      "products",
      S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("productName", S.anyOf([S.null(), S.string()]))
          .prop("price", S.anyOf([S.null(), S.number()]))
          .prop("specialPrice", S.anyOf([S.null(), S.number()]))
          .prop("volume", S.integer())
          .prop("type", S.enum(["draft", "bottle", "can", "other"]))
          .prop("currencyCode", S.string())
          .prop("productId", S.anyOf([S.null(), S.integer()]))
      )
    )
    .prop("features", S.array().items(S.integer()))
    .prop(
      "revisions",
      S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("version", S.integer())
          .prop("changes", S.object())
      )
    );

  const storeSchema = S.object()
    .additionalProperties(false)
    .id("storeSchema")
    .prop("id", S.integer())
    .required()
    .extend(storeBaseSchema);

  fastify.addSchema(storeBaseSchema);
  fastify.addSchema(storeSchema);
});

module.exports = { storeSchema };
