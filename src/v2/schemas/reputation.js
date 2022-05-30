const S = require("fluent-json-schema");

const reputationSchema = function (fastify) {
  fastify.addSchema(
    S.object()
      .id("reputationSchema")
      .prop("total", S.integer())
      .prop(
        "fields",
        S.array().items(
          S.object()
            .prop("fieldName", S.string())
            .prop("reputation", S.integer())
        )
      )
  );
};

module.exports = { reputationSchema };
