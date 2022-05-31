const S = require("fluent-json-schema");

const { User } = require("../../entity/User.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");

const getProfile = {
  schema: {
    summary: "Get user profile",
    tags: ["user"],
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

    console.log(req.user);

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
    body: S.object().prop(
      "favorites",
      S.array().items(S.object().prop("id", S.integer()))
    ),
    response: {
      200: S.object().prop("statusCode", S.integer()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req) => {
    const { favorites } = req.body;

    req.user.favorites = favorites;
    await req.server.db.manager.save(User, req.user);

    return { statusCode: 200 };
  },
};

module.exports = { getProfile, updateProfile };
