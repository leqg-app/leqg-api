const app = require("./app.js");

const fastify = app({
  logger: {
    level: "info",
    prettyPrint: true,
  },
});

const port = process.env.PORT || 3000;
fastify.listen(port, function (err, address) {
  console.log(`Listening on ${port}`);
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
