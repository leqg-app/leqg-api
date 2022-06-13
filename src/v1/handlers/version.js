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
        .prop("features", S.integer())
        .prop("reset", S.integer())
        .prop(
          "count",
          S.object()
            .prop("stores", S.integer())
            .prop("products", S.integer())
            .prop("rates", S.integer())
            .prop("features", S.integer())
        ),
    },
  },
  handler: async (req) => {
    const versions = await req.server.db.manager.find(Version);
    return versions.reduce(
      (versions, { name, version, count }) => {
        versions[name] = version;
        versions.count[name] = count;
        return versions;
      },
      { count: {} }
    );
  },
};

module.exports = { getAllVersions };
