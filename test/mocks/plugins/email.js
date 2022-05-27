const fastifyPlugin = require("fastify-plugin");

async function email(fastify) {
  fastify.decorate("email", {
    send: () => Promise.resolve(),
  });
}

module.exports = fastifyPlugin(email);
