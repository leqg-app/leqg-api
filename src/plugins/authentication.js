import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "fastify-jwt";

import { User } from "../entity/User.js";

export const ROLES = {
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
      reply.status(401).send({ message: err.message });
    }
  });
}

export function isRole(role) {
  return async function (req, reply) {
    const user = await req.server.authenticate(req, reply);
    if (!user || user.blocked || user.role < role) {
      reply.status(401).send({ message: "Invalid user" });
    }
    req.user = user;
  };
}

export default fastifyPlugin(authentication);
