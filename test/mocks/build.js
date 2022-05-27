const tap = require("tap");

const email = require("./plugins/email.js");
const database = require("./plugins/database.js");

const build = tap.mock("../../src/app.js", {
  "../../src/plugins/email.js": email,
  "../../src/plugins/database.js": database,
  crypto: {
    randomBytes: () => "reset-code",
  },
});

module.exports = () =>
  build({
    logger: {
      level: "warn",
      prettyPrint: true,
    },
  });
