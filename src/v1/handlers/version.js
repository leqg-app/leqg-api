const S = require("fluent-json-schema");

const { Version } = require("../../entity/Version.js");

const getAllVersions = {
  schema: {
    summary: "Get all versions",
    tags: ["version"],
    response: {
      200: S.object()
        .prop("stores", S.integer())
        .prop("products", S.integer())
        .prop("rates", S.integer())
        .prop("features", S.integer()),
    },
  },
  handler: async (req, rep) => {
    const repo = rep.server.db.getRepository(Version);
    const versions = await repo.find();
    return versions.reduce((versions, { name, version }) => {
      versions[name] = version;
      return versions;
    }, {});
  },
};

module.exports = { getAllVersions };
