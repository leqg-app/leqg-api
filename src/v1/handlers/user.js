import S from "fluent-json-schema";

const getProfile = (fastify) => ({
  schema: {
    summary: "Get user profile",
    response: {
      200: S.ref("userSchema"),
    },
  },
  onRequest: [fastify.authenticate],
  handler: async (req, rep) => {
    return req.user;
  },
});

const updateProfile = {
  schema: {
    summary: "Update user profile",
    response: {
      200: S.object(), // TODO
    },
  },
  handler: async (req, rep) => {
    // TODO
    return {};
  },
};

export { getProfile, updateProfile };
