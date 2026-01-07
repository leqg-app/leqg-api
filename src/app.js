const Fastify = require("fastify");
const fastifyEnv = require("@fastify/env");
const fastifyCors = require("@fastify/cors");
const fastifyMultipart = require("@fastify/multipart");
const fastifyStatic = require("@fastify/static");
const S = require("fluent-json-schema");
const path = require("path");

const database = require("./plugins/database.js");
const email = require("./plugins/email.js");
const { authentication } = require("./plugins/authentication.js");
const v1 = require("./v1/routes.js");
const v2 = require("./v2/routes.js");

function app(opts = {}) {
  const fastify = Fastify(opts);

  const options = {
    schema: S.object()
      .prop("JWT_SECRET", S.string())
      .prop("DB_HOST", S.string())
      .prop("DB_USER", S.string())
      .prop("DB_PASSWORD", S.string())
      .prop("DB_NAME", S.string())
      .prop("DB_PORT", S.number())
      .prop("SIB_API_KEY", S.string())
      .prop("UPLOAD_DIR", S.string().default("uploads")),
    dotenv: true,
  };

  fastify.register(fastifyCors, {
    origin: "https://leqg.app",
  });
  fastify.register(fastifyEnv, options);

  // Register multipart for file uploads
  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  fastify.register(database);
  fastify.register(email);
  fastify.register(authentication);

  // Register static file serving after env is loaded
  fastify.after(() => {
    const uploadDir = path.join(process.cwd(), fastify.config.UPLOAD_DIR);
    fastify.register(fastifyStatic, {
      root: uploadDir,
      prefix: "/uploads/",
    });
  });

  fastify.register(v1);
  fastify.register(v2);

  fastify.get("/", async () => ({
    statusCode: 200,
  }));

  return fastify;
}

module.exports = app;
