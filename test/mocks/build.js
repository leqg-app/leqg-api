const tap = require("tap");
const crypto = require("crypto");

const email = require("./plugins/email.js");
const database = require("./plugins/database.js");

const build = tap.mockRequire("../../src/app.js", {
  "../../src/plugins/email.js": email,
  "../../src/plugins/database.js": database,
  crypto: {
    ...crypto,
    randomBytes: () => ({
      toString: (encoding) =>
        encoding === "hex" ? "reset-code" : "reset-code",
    }),
  },
});

module.exports = () =>
  build({
    logger: {
      level: "warn",
      transport: {
        target: "pino-pretty",
      },
    },
  });
