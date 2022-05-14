const fastifyPlugin = require("fastify-plugin");
const S = require("fluent-json-schema");

const storeSchema = fastifyPlugin(async function (fastify) {
  const productStoreSchema = S.object()
    .id("productStoreSchema")
    .prop("id", S.integer())
    .prop("productName", S.anyOf([S.null(), S.string()]))
    .prop("price", S.anyOf([S.null(), S.number()]))
    .prop("specialPrice", S.anyOf([S.null(), S.number()]))
    .prop("volume", S.integer())
    .prop("type", S.string())
    .prop("currencyCode", S.string())
    .prop("product", S.anyOf([S.null(), S.integer()]));

  const storeBaseSchema = S.object()
    .additionalProperties(false)
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
    .prop("products", S.array().items(S.ref("productStoreSchema")))
    .prop("features", S.array().items(S.integer()));

  const storeSchema = S.object()
    .additionalProperties(false)
    .id("storeSchema")
    .prop("id", S.integer())
    .prop(
      "revisions",
      S.array().items(
        S.object()
          .prop("user", S.object().prop("username", S.string()))
          .prop(
            "changes",
            S.array().items(
              S.object()
                .prop("type", S.string())
                .prop("field", S.string())
                .prop(
                  "delta",
                  S.anyOf([S.string(), S.number(), S.ref("productStoreSchema")])
                )
            )
          )
      )
    )
    .required()
    .extend(storeBaseSchema);

  fastify.addSchema(productStoreSchema);
  fastify.addSchema(storeBaseSchema);
  fastify.addSchema(storeSchema);
});

module.exports = { storeSchema };
