import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "fastify-jwt";

import { User } from "../entity/User.js";

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
      const user = await repo.findOneBy({ id });

      if (!user || user.blocked) {
        reply.status(401).send({ message: "Invalid user" });
      }

      return user;
    } catch (err) {
      reply.status(401).send({ message: err.message });
    }
  });
}

export default fastifyPlugin(authentication);
