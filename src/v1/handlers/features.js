import S from "fluent-json-schema";

import { FeatureCategory } from "../../entity/FeatureCategory.js";

const getAllFeatures = {
  schema: {
    summary: "Get all features",
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

export { getAllFeatures };
