const app = require("./app.js");

const prod = process.env.NODE_ENV === "production";
const fastify = app({
  logger: {
    level: prod ? "warn" : "info",
    prettyPrint: !prod,
  },
});

const port = process.env.PORT || 3000;
fastify.listen(port, function (err) {
  console.log(`Listening on ${port}`);
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
