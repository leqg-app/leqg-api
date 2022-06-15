const purest = require("purest");
const appleSignin = require("apple-signin-auth");

function apple(access_token) {
  return appleSignin.verifyIdToken(access_token, {
    audience: "com.leqg.app",
    ignoreExpiration: true,
  });
}

async function google(id_token) {
  const google = purest({ provider: "google" });
  const userInfo = await google
    .query("oauth")
    .get("tokeninfo")
    .qs({ id_token })
    .request();
  return userInfo && userInfo.body;
}

module.exports = { apple, google };
