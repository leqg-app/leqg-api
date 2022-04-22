import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "fastify-jwt";

import { User } from "../entity/User.js";

async function authentication(fastify) {
  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      const { id } = await request.jwtVerify();
      const repo = request.server.db.getRepository(User);
      const user = await repo.findOneBy({ id });

      if (user.blocked) {
        throw new Error("User is disabled");
      }

      request.user = user;
    } catch (err) {
      reply.send(err);
    }
  });
}

export default fastifyPlugin(authentication);
