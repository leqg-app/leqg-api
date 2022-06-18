const fastifyPlugin = require("fastify-plugin");
const fastifyJwt = require("@fastify/jwt");

const { User } = require("../entity/User.js");

const ROLES = {
  USER: 1,
  ADMIN: 3,
};

async function authentication(fastify) {
  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
    sign: {
      expiresIn: "365d",
    },
  });
}

function isRole(role, options = {}) {
  const { relations = [] } = options;
  return async function (request, reply) {
    try {
      const { id } = await request.jwtVerify();
      const repo = request.server.db.getRepository(User);
      const user = await repo.findOne({ where: { id }, relations });
      if (!user || user.blocked || user.role < role) {
        return reply.status(401).send({ error: "user.invalid" });
      }
      request.user = user;
    } catch (err) {
      return reply.status(401).send({ error: err.message });
    }
  };
}

module.exports = {
  authentication: fastifyPlugin(authentication),
  ROLES,
  isRole,
};
