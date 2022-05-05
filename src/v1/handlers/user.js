const S = require("fluent-json-schema");

const { User } = require("../../entity/User.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");

const getProfile = {
  schema: {
    summary: "Get user profile",
    tags: ["user"],
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    // Sign new jwt to expand expiration
    const jwt = await reply.jwtSign({
      id: req.user.id,
    });

    return {
      jwt,
      ...req.user,
    };
  },
};

const updateProfile = {
  schema: {
    summary: "Update user profile",
    tags: ["user"],
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

module.exports = { getProfile, updateProfile };
