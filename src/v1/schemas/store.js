const S = require("fluent-json-schema");

const storeSchema = function (fastify) {
  const storeMinified = S.object()
    .id("storeMinified")
    .prop("id", S.integer())
    .prop("name", S.string())
    .prop("lng", S.number())
    .prop("lat", S.number())
    .prop("price", S.anyOf([S.null(), S.number()]))
    .prop("currency", S.string())
    .prop("specialPrice", S.anyOf([S.null(), S.number()]))
    .prop("products", S.array().items(S.integer()))
    .prop(
      "s",
      S.array().items(
        S.object()
          .prop("cd", S.boolean())
          .prop("o", S.integer())
          .prop("c", S.integer())
          .prop("os", S.integer())
          .prop("cs", S.integer())
      )
    )
    .prop("f", S.array().items(S.integer()));

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
    .id("storeBaseSchemav1")
    .prop("name", S.string().required())
    .prop("latitude", S.number().required())
    .prop("longitude", S.number().required())
    .prop("address", S.string().required())
    .prop("phone", S.anyOf([S.null(), S.string()]))
    .prop("website", S.anyOf([S.null(), S.string()]))
    .prop(
      "schedules",
      S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("dayOfWeek", S.integer())
          .prop("opening", S.integer().raw({ nullable: true }))
          .prop("closing", S.integer().raw({ nullable: true }))
          .prop("openingSpecial", S.integer().raw({ nullable: true }))
          .prop("closingSpecial", S.integer().raw({ nullable: true }))
          .prop("closed", S.boolean())
      )
    )
    .prop("products", S.array().items(S.ref("productStoreSchema")).default([]))
    .prop("features", S.array().items(S.integer()).default([]));

  const storeSchema = S.object()
    .additionalProperties(false)
    .id("storeSchema")
    .prop("id", S.integer())
    .prop("countryCode", S.string())
    .prop(
      "revisions",
      S.array().items(
        S.object()
          .prop("created_at", S.number())
          .prop("author", S.object().prop("username", S.string()))
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

  fastify.addSchema(storeMinified);
  fastify.addSchema(productStoreSchema);
  fastify.addSchema(storeBaseSchema);
  fastify.addSchema(storeSchema);
};

module.exports = { storeSchema };
