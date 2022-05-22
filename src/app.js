const Fastify = require("fastify");
const fastifyEnv = require("@fastify/env");
const fastifyCors = require("@fastify/cors");
const S = require("fluent-json-schema");

const database = require("./plugins/database.js");
const email = require("./plugins/email.js");
const { authentication } = require("./plugins/authentication.js");
const v1 = require("./v1/routes.js");

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

  fastify.register(fastifyCors, {
    origin: "https://leqg.app",
  });
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

module.exports = app;
