const fastifyPlugin = require("fastify-plugin");
const S = require("fluent-json-schema");

const reputationSchema = fastifyPlugin(async function (fastify) {
  fastify.addSchema(
    S.object()
      .id("reputationSchema")
      .prop("total", S.integer())
      .prop(
        "fields",
        S.array().items(
          S.object().prop("field", S.string()).prop("reputation", S.integer())
        )
      )
  );
});

module.exports = { reputationSchema };
