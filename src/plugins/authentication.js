const fastifyPlugin = require("fastify-plugin");
const fastifyJwt = require("fastify-jwt");

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

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      const { id } = await request.jwtVerify();
      const repo = request.server.db.getRepository(User);
      return repo.findOneBy({ id });
    } catch (err) {
      reply.status(401).send({ error: err.message });
    }
  });
}

function isRole(role) {
  return async function (req, reply) {
    const user = await req.server.authenticate(req, reply);
    if (!user || user.blocked || user.role < role) {
      reply.status(401).send({ error: "Invalid user" });
    }
    req.user = user;
  };
}

module.exports = {
  authentication: fastifyPlugin(authentication),
  ROLES,
  isRole,
};
