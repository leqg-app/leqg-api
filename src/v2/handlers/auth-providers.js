const purest = require("purest");

async function google(id_token) {
  const google = purest({ provider: "google" });
  const userInfo = await google
    .query("oauth")
    .get("tokeninfo")
    .qs({ id_token })
    .request();
  return userInfo && userInfo.body;
}

module.exports = { google };
