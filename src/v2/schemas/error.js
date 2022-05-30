const S = require("fluent-json-schema");

const errorSchema = function (fastify) {
  fastify.addSchema(S.object().id("errorSchema").prop("error", S.string()));
};

module.exports = { errorSchema };
