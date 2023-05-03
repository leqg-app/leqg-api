const app = require("./app.js");

const prod = process.env.NODE_ENV === "production";
const fastify = app({
  logger: {
    level: prod ? "warn" : "info",
    transport: {
      target: "pino-pretty",
    },
  },
});

const port = process.env.PORT || 3000;
fastify.listen({ port, host: "0.0.0.0" }, function (err) {
  console.log(`Listening on ${port}`);
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
