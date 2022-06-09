const S = require("fluent-json-schema");

const { Version } = require("../../entity/Version.js");
const { Store } = require("../../entity/Store.js");

const getAllVersions = {
  schema: {
    summary: "Get all versions",
    tags: ["version"],
    response: {
      200: S.object()
        .prop("stores", S.integer())
        .prop("products", S.integer())
        .prop("rates", S.integer())
        .prop("features", S.integer())
        .prop("storeCount", S.integer()),
    },
  },
  handler: async (req) => {
    const versions = await req.server.db.manager.find(Version);
    const storeCount = await req.server.db.manager.count(Store);
    const version = versions.reduce((versions, { name, version }) => {
      versions[name] = version;
      return versions;
    }, {});
    version.storeCount = storeCount;
    return version;
  },
};

module.exports = { getAllVersions };
