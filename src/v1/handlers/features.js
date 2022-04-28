const S = require("fluent-json-schema");

const { FeatureCategory } = require("../../entity/FeatureCategory.js");

const getAllFeatures = {
  schema: {
    summary: "Get all features",
    tags: ["feature"],
    response: {
      200: S.array().items(
        S.object()
          .prop("name", S.string())
          .prop(
            "features",
            S.array().items(
              S.object().prop("id", S.integer()).prop("name", S.string())
            )
          )
      ),
    },
  },
  handler: async (req, rep) => {
    const repo = rep.server.db.getRepository(FeatureCategory);
    return repo.find();
  },
};

module.exports = { getAllFeatures };
