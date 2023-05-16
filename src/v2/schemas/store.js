const S = require("fluent-json-schema");

const storeSchema = function (fastify) {
  const storeMinified = S.array()
    .id("storeMinified")
    .items([
      S.integer(), // 0 id
      S.string(), // 1 name
      S.string(), // 2 address
      S.number(), // 3 latitude
      S.number(), // 4 longitude
      S.number(), // 5 cheapest price TODO: NOT NULL
      S.number(), // 6 cheapest specialPrice
      S.string(), // 7 currencyCode
      S.array().items(
        S.array()
          .items([
            // 8 products
            S.integer(), // productId
            S.number(), // price
            S.number(), // specialPrice
            S.integer(), // volume
          ])
          .minItems(4)
          .maxItems(4)
      ),
      S.array().items(
        // 9 schedules
        S.anyOf([
          S.array().items(
            S.array().items([S.integer(), S.integer()]).minItems(0).maxItems(2)
          ),
          S.integer(),
        ])
      ),
      S.array().items(
        // 10 features
        S.integer() // id
      ),
      S.number(), // 11 rate
    ])
    .minItems(12)
    .maxItems(12);

  const productStoreSchema = S.object()
    .id("productStoreSchema")
    .additionalProperties(false)
    .prop("id", S.integer())
    .prop("productName", S.anyOf([S.null(), S.string()]))
    .prop("price", S.anyOf([S.null(), S.number()]))
    .prop("specialPrice", S.anyOf([S.null(), S.number()]))
    .prop("volume", S.integer())
    .prop("type", S.string())
    .prop("currencyCode", S.string())
    .prop("productId", S.anyOf([S.null(), S.integer()]));

  const schedulesSchema = S.object()
    .id("schedulesSchema")
    .additionalProperties(false)
    .prop("id", S.integer())
    .prop("dayOfWeek", S.integer())
    .prop(
      "opening",
      S.integer().raw({
        nullable: true,
        minimum: 0,
        maximum: 1440,
      })
    )
    .prop(
      "closing",
      S.integer().raw({
        nullable: true,
        minimum: 0,
        maximum: 1440,
      })
    )
    .prop(
      "openingSpecial",
      S.integer().raw({
        nullable: true,
        minimum: 0,
        maximum: 1440,
      })
    )
    .prop(
      "closingSpecial",
      S.integer().raw({
        nullable: true,
        minimum: 0,
        maximum: 1440,
      })
    )
    .prop("closed", S.boolean());

  const storeBaseSchema = S.object()
    .id("storeBaseSchema")
    .additionalProperties(false)
    .prop("name", S.string().required())
    .prop("latitude", S.number().required())
    .prop("longitude", S.number().required())
    .prop("address", S.string().required())
    .prop("phone", S.anyOf([S.null(), S.string()]))
    .prop("website", S.anyOf([S.null(), S.string()]))
    .prop("schedules", S.array().items(S.ref("schedulesSchema")).default([]))
    .prop("products", S.array().items(S.ref("productStoreSchema")).default([]))
    .prop(
      "features",
      S.array().items(S.object().prop("id", S.integer())).default([])
    );

  const storeSchema = S.object()
    .id("storeSchema")
    .additionalProperties(false)
    .prop("id", S.integer())
    .prop("countryCode", S.string())
    .prop("rate", S.number())
    .prop("rateCount", S.integer())
    .prop(
      "rates",
      S.array().items(
        S.object()
          .prop("rate1", S.integer())
          .prop("rate2", S.integer())
          .prop("rate3", S.integer())
          .prop("createdAt", S.number())
          .prop("updatedAt", S.number())
          .prop(
            "user",
            S.object().prop("id", S.integer()).prop("username", S.string())
          )
          .prop(
            "recommendedProducts",
            S.array().items(S.object().prop("id", S.integer()))
          )
      )
    )
    .prop(
      "revisions",
      S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("createdAt", S.number())
          .prop(
            "user",
            S.object().prop("id", S.integer()).prop("username", S.string())
          )
          .prop(
            "changes",
            S.array().items(
              S.object()
                .prop("type", S.string())
                .prop("field", S.string())
                .prop(
                  "delta",
                  S.anyOf([
                    S.string(),
                    S.number(),
                    S.ref("schedulesSchema"),
                    S.ref("productStoreSchema"),
                  ])
                )
            )
          )
      )
    )
    .prop(
      "validations",
      S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("createdAt", S.number())
          .prop(
            "user",
            S.object().prop("id", S.integer()).prop("username", S.string())
          )
      )
    )
    .prop("updatedAt", S.number())
    .extend(storeBaseSchema);

  fastify.addSchema(storeMinified);
  fastify.addSchema(productStoreSchema);
  fastify.addSchema(schedulesSchema);
  fastify.addSchema(storeBaseSchema);
  fastify.addSchema(storeSchema);
};

module.exports = { storeSchema };
