import fastifyPlugin from "fastify-plugin";
import S from "fluent-json-schema";

const userSchema = fastifyPlugin(async function (fastify) {
  fastify.addSchema(
    S.object()
      .id("userSchema")
      .prop("jwt", S.string())
      .prop("username", S.string())
      .prop("email", S.string())
      .prop("contributions", S.integer())
  );
});

export { userSchema };
