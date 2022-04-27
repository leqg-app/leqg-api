const fastifyPlugin = require("fastify-plugin");
const S = require("fluent-json-schema");

const userSchema = fastifyPlugin(async function (fastify) {
  fastify.addSchema(
    S.object()
      .id("userSchema")
      .prop("jwt", S.string())
      .prop(
        "user",
        S.object()
          .prop("username", S.string())
          .prop("email", S.string())
          .prop("contributions", S.integer())
          .prop(
            "favorites",
            S.array().items(
              S.object()
                .prop("id", S.integer())
                .prop("name", S.string())
                .prop("address", S.string())
            )
          )
      )
  );
});

module.exports = { userSchema };
