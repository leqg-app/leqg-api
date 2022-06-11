const S = require("fluent-json-schema");

const userSchema = function (fastify) {
  const userSchemaBase = S.object()
    .id("userSchemaBase")
    .additionalProperties(false)
    .prop("jwt", S.string())
    .prop("username", S.string())
    .prop("email", S.string())
    .prop("contributions", S.integer())
    .prop("reputation", S.integer())
    .prop(
      "favorites",
      S.array().items(
        S.object()
          .additionalProperties(false)
          .prop("id", S.integer())
          .prop("name", S.string())
          .prop("address", S.string())
          .prop("longitude", S.number())
          .prop("latitude", S.number())
      )
    );

  const userSchema = S.object()
    .id("userSchema")
    .additionalProperties(false)
    .prop("jwt", S.string())
    .prop("user", S.ref("userSchemaBase"));

  fastify.addSchema(userSchemaBase);
  fastify.addSchema(userSchema);
};

module.exports = { userSchema };
