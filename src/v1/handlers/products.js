import S from "fluent-json-schema";

import { Product } from "../../entity/Product.js";

const getAllProducts = {
  schema: {
    summary: "Get all products",
    response: {
      200: S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("name", S.string())
          .prop("type", S.string())
          .prop(
            "custom",
            S.anyOf([S.null(), S.object().prop("color", S.string())])
          )
      ),
    },
  },
  handler: async (req, rep) => {
    const repo = rep.server.db.getRepository(Product);
    return repo.find();
  },
};

export { getAllProducts };
