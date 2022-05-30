const S = require("fluent-json-schema");

const errorSchema = function (fastify) {
  fastify.addSchema(
    S.object()
      .id("errorSchema")
      .prop("error", S.string())
      .prop(
        "data",
        S.array().items(
          S.object().prop(
            "messages",
            S.array().items(S.object().prop("id", S.string()))
          )
        )
      )
  );
};

const formatError = (message) => ({
  error: message,
  data: [{ messages: [{ id: message }] }],
});

module.exports = { errorSchema, formatError };
