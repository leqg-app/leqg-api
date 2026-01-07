const S = require("fluent-json-schema");

const photoSchema = function (fastify) {
  const photoSchema = S.object()
    .id("photoSchema")
    .additionalProperties(false)
    .prop("id", S.integer())
    .prop("url", S.string())
    .prop("caption", S.anyOf([S.null(), S.string()]))
    .prop("createdAt", S.number())
    .prop("updatedAt", S.number())
    .prop(
      "user",
      S.object().prop("id", S.integer()).prop("username", S.string())
    )
    .prop(
      "product",
      S.anyOf([
        S.null(),
        S.object()
          .prop("id", S.integer())
          .prop("name", S.string())
          .prop("type", S.string()),
      ])
    );

  fastify.addSchema(photoSchema);
};

module.exports = { photoSchema };
