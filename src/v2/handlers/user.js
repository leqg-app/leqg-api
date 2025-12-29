const S = require("fluent-json-schema");

const { User } = require("../../entity/User.js");
const { Contribution } = require("../../entity/Contribution.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");

const getProfile = {
  schema: {
    summary: "Get user profile",
    tags: ["user"],
    response: {
      200: S.ref("userSchema"),
    },
  },
  onRequest: [
    isRole(ROLES.USER, { relations: ["favorites", "contributions"] }),
  ],
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

const getContributions = {
  schema: {
    summary: "Get user contributions list",
    tags: ["user"],
    response: {
      200: S.array().items(S.ref("contributionSchema")),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req) => {
    return req.server.db.manager.find(Contribution, {
      where: {
        user: {
          id: req.user.id,
        },
      },
      take: 20,
      order: {
        createdAt: "DESC",
      },
      relations: ["user", "revision.store", "validation.store"],
    });
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
  onRequest: [
    isRole(ROLES.USER, { relations: ["favorites", "contributions"] }),
  ],
  handler: async (req) => {
    const { favorites } = req.body;

    req.user.favorites = favorites;
    await req.server.db.manager.save(User, req.user);

    return { statusCode: 200 };
  },
};

const deleteProfile = {
  schema: {
    summary: "Delete own user profile",
    tags: ["user"],
    response: {
      200: S.object().prop("statusCode", S.integer()),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req) => {
    const { id } = req.user;
    await req.server.db.manager.update(
      User,
      {
        id,
      },
      {
        email: `deleted.${id}@leqg.app`,
        password: "deleted",
        provider: "deleted",
      }
    );

    return { statusCode: 200 };
  },
};

module.exports = { getProfile, getContributions, updateProfile, deleteProfile };
