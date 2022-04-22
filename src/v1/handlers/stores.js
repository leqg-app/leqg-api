import S from "fluent-json-schema";

import { Store } from "../../entity/Store.js";
import { formatStore } from "../utils/format.js";

const getAllStores = {
  schema: {
    summary: "Get all stores",
    response: {
      200: S.array().items(
        S.object()
          .prop("id", S.integer())
          .prop("name", S.string())
          .prop("lng", S.number())
          .prop("lat", S.number())
          .prop("price", S.number())
          .prop("currency", S.string())
          .prop("specialPrice", S.number())
          .prop("products", S.array().items(S.integer()))
          .prop(
            "s",
            S.array().items(
              S.object()
                .prop("cd", S.boolean())
                .prop("o", S.integer())
                .prop("c", S.integer())
                .prop("os", S.integer())
                .prop("cs", S.integer())
            )
          )
          .prop("f", S.array().items(S.integer()))
      ),
    },
  },
  handler: async (req, rep) => {
    const storeRepo = rep.server.db.getRepository(Store);
    const stores = await storeRepo.find();
    return stores.map(formatStore);
  },
};

export { getAllStores };
