import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "fastify-jwt";

import * as auth from "./handlers/auth.js";
import * as user from "./handlers/user.js";

async function authentication(fastify) {
  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.post("/auth/local", auth.login);
  fastify.post("/auth/local/register", auth.register);
  fastify.post("/auth/forgot-password", auth.forgotPassword);
  fastify.post("/auth/reset-password", auth.resetPassword);

  fastify.get("/users/me", user.getProfile);
  fastify.put("/users/me", user.updateProfile);
}

export default fastifyPlugin(authentication);
