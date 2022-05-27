const fastifyPlugin = require("fastify-plugin");
const S = require("fluent-json-schema");

const errorSchema = fastifyPlugin(async function (fastify) {
  fastify.addSchema(S.object().id("errorSchema").prop("error", S.string()));
});

module.exports = { errorSchema };
