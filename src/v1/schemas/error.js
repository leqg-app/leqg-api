const fastifyPlugin = require("fastify-plugin");
const S = require("fluent-json-schema");

const errorSchema = fastifyPlugin(async function (fastify) {
  fastify.addSchema(
    S.array()
      .id("errorSchema")
      .items(
        S.object().prop(
          "messages",
          S.array().items(S.object().prop("id", S.string()))
        )
      )
  );
});

const formatError = (message) => [{ messages: [{ id: message }] }];

module.exports = { errorSchema, formatError };
