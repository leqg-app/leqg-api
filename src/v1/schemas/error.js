import fastifyPlugin from "fastify-plugin";
import S from "fluent-json-schema";

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

export { errorSchema, formatError };
