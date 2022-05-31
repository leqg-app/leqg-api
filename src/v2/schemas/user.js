const S = require("fluent-json-schema");

const userSchema = function (fastify) {
  const contributionSchema = S.object()
    .additionalProperties(false)
    .id("contributionSchema")
    .prop("id", S.integer())
    .prop("reputation", S.integer())
    .prop("reason", S.string());

  const userSchema = S.object()
    .additionalProperties(false)
    .id("userSchema")
    .prop("jwt", S.string())
    .prop("username", S.string())
    .prop("email", S.string())
    .prop(
      "favorites",
      S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("name", S.string())
          .prop("address", S.string())
      )
    )
    .prop("contributions", S.array().items(S.ref("contributionSchema")));

  fastify.addSchema(contributionSchema);
  fastify.addSchema(userSchema);
};

module.exports = { userSchema };
