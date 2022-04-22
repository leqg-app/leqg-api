import S from "fluent-json-schema";

const getProfile = {
  schema: {
    summary: "Get user profile",
    response: {
      200: S.object(), // TODO
    },
  },
  handler: async (req, rep) => {
    // TODO
    return {};
  },
};

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
