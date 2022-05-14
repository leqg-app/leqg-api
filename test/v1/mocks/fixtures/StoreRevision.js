const entities = require("../../../../src/entity/index.js");

module.exports.StoreRevision = {
  repository: entities.StoreRevision,
  data: [
    {
      user: 1,
      store: 1,
      version: 1,
      changes: [{ type: "initial" }],
      contribution: {
        user: 1,
        reason: "store.creation",
        reputation: 25,
      },
    },
    {
      user: 2,
      store: 2,
      version: 1,
      changes: [{ type: "initial" }],
      contribution: {
        user: 2,
        reason: "store.creation",
        reputation: 15,
      },
    },
  ],
};
