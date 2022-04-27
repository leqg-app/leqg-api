import S from "fluent-json-schema";

import { User } from "../../entity/User.js";
import { isRole, ROLES } from "../../plugins/authentication.js";

const getProfile = {
  schema: {
    summary: "Get user profile",
    response: {
      200: S.ref("userSchema"),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    // Sign new jwt to expand expiration
    const jwt = await reply.jwtSign({
      id: req.user.id,
    });

    return {
      jwt,
      user: req.user,
    };
  },
};

const updateProfile = {
  schema: {
    summary: "Update user profile",
    body: S.object().prop("favorites", S.array().items(S.integer())),
    response: {
      200: S.object().prop("statusCode", S.integer()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { favorites } = req.body;

    const repoUser = req.server.db.getRepository(User);
    req.user.favorites = favorites.map((id) => ({ id }));
    await repoUser.save(req.user);

    return { statusCode: 200 };
  },
};

export { getProfile, updateProfile };
