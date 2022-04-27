import Fastify from "fastify";
import fastifyEnv from "fastify-env";
import S from "fluent-json-schema";

import database from "./plugins/database.js";
import email from "./plugins/email.js";
import authentication from "./plugins/authentication.js";
import v1 from "./v1/routes.js";

function app(opts = {}) {
  const fastify = Fastify(opts);

  const options = {
    schema: S.object()
      .prop("JWT_SECRET", S.string())
      .prop("DB_HOST", S.string())
      .prop("DB_USER", S.string())
      .prop("DB_PASSWORD", S.string())
      .prop("DB_NAME", S.string())
      .prop("SIB_API_KEY", S.string()),
    dotenv: true,
  };

  fastify.register(fastifyEnv, options);
  fastify.register(database);
  fastify.register(email);
  fastify.register(authentication);
  fastify.register(v1);

  fastify.get("/", async () => ({
    statusCode: 200,
  }));

  return fastify;
}

export default app;
