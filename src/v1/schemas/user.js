const S = require("fluent-json-schema");

const userSchema = function (fastify) {
  fastify.addSchema(
    S.object()
      .id("userSchema")
      .prop("jwt", S.string())
      .prop(
        "user",
        S.object()
          .additionalProperties(false)
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
          )
      )
  );
};

module.exports = { userSchema };
