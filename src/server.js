const app = require("./app.js");

const fastify = app({
  logger: {
    level: "info",
    prettyPrint: true,
  },
});

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
