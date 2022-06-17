const S = require("fluent-json-schema");
const crypto = require("crypto");

const { User } = require("../../entity/index.js");
const { hashPassword, comparePassword } = require("../../v1/utils/password.js");
const authProviders = require("./auth-providers.js");

const login = {
  schema: {
    summary: "Authenticate user",
    tags: ["user"],
    body: S.object()
      .prop("identifier", S.string().required())
      .prop("password", S.string().required()),
    response: {
      200: S.ref("userSchema"),
      400: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { identifier, password } = req.body;
    const repo = req.server.db.getRepository(User);
    const user = await repo.findOne({
      where: { username: identifier },
      relations: ["favorites", "contributions"],
    });

    if (!user) {
      return reply.status(400).send({ error: "user.credentials" });
    }

    if (user.blocked) {
      return reply.status(400).send({ error: "user.blocked" });
    }

    if (user.provider !== "local") {
      return reply.status(400).send({ error: "user.provider" });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return reply.status(400).send({ error: "user.credentials" });
    }

    user.jwt = await reply.jwtSign({
      id: user.id,
    });

    return user;
  },
};

const register = {
  schema: {
    summary: "Register user",
    tags: ["user"],
    body: S.object()
      .prop("username", S.string().required())
      .prop("password", S.string().required())
      .prop("email", S.string().format(S.FORMATS.EMAIL).required()),
    response: {
      200: S.ref("userSchema"),
      400: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { username, password, email } = req.body;
    const repo = req.server.db.getRepository(User);

    const userExist = await repo.findOne({ where: [{ username }, { email }] });
    if (userExist) {
      if (userExist.username === username) {
        return reply.status(400).send({ error: "user.username.taken" });
      }
      if (userExist.email === email) {
        return reply.status(400).send({ error: "user.email.taken" });
      }
    }

    const hashedPassword = await hashPassword(password);
    const { id } = await repo.save({
      username,
      email,
      password: hashedPassword,
      provider: "local",
      role: 1,
      confirmed: 1,
    });

    // Refetch user to get relations, maybe better way
    const user = await repo.findOne({
      where: { id },
      relations: ["favorites", "contributions"],
    });

    // User is already signed in
    user.jwt = await reply.jwtSign({
      id: id,
    });

    return user;
  },
};

const forgotPassword = {
  schema: {
    summary: "Send mail to reset password",
    tags: ["user"],
    body: S.object().prop(
      "email",
      S.string().format(S.FORMATS.EMAIL).required()
    ),
    response: {
      200: S.object().prop("statusCode", S.integer()),
      400: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { email } = req.body;
    const repo = req.server.db.getRepository(User);

    const user = await repo.findOneBy({ email });
    if (!user) {
      return reply.status(400).send({ error: "user.notfound" });
    }

    if (user.blocked) {
      return reply.status(400).send({ error: "user.blocked" });
    }

    if (user.provider !== "local") {
      return reply.status(400).send({ error: "user.provider" });
    }

    const resetPasswordToken = crypto.randomBytes(64).toString("hex");

    user.resetPasswordToken = resetPasswordToken;
    await repo.save(user);

    const html = `
<p>${user.username},</p>

<p>Il paraît que vous avez oublié votre mot de passe, mais heureusement nous avons tout prévu.</p>

<p>Procédure habituelle, vous connaissez bien, il faut cliquer sur le lien:</p>
<p>https://leqg.app/reset-password?code=${resetPasswordToken}</p>

<p>A bientôt !</p>
<p>Le QG</p>
`;

    const text = `
${user.username},

Il paraît que vous avez oublié votre mot de passe, mais heureusement nous avons tout prévu.

Procédure habituelle, vous connaissez bien, il faut cliquer sur le lien:
https://leqg.app/reset-password?code=${resetPasswordToken}

A bientôt !
Le QG
`;

    await req.server.email.send({
      to: user.email,
      subject: "Mot de passe oublié",
      html,
      text,
    });

    return { statusCode: 200 };
  },
};

const resetPassword = {
  schema: {
    summary: "Reset user password",
    tags: ["user"],
    body: S.object()
      .prop("code", S.string().required())
      .prop("password", S.string().required())
      .prop("passwordConfirmation", S.string().required()),
    response: {
      200: S.object().prop("statusCode", S.integer()),
      400: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { code, password, passwordConfirmation } = req.body;

    if (password !== passwordConfirmation) {
      return reply.status(400).send({ error: "user.password.matching" });
    }

    const repo = req.server.db.getRepository(User);

    const user = await repo.findOneBy({ resetPasswordToken: code });
    if (!user) {
      return reply.status(400).send({ error: "code.notfound" });
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = null;
    await repo.save(user);

    return { statusCode: 200 };
  },
};

const providerRegister = {
  schema: {
    summary: "Register user with third party provider",
    tags: ["user"],
    params: S.object().prop("provider", S.string()),
    body: S.object()
      .prop("username", S.string())
      .prop("auth_token", S.string()),
    response: {
      200: S.ref("userSchema"),
      400: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { provider } = req.params;
    const { username, auth_token } = req.body;
    const repo = req.server.db.getRepository(User);

    if (!authProviders[provider]) {
      return reply.status(400).send({ error: "user.provider.invalidprovider" });
    }

    const userInfo = await authProviders[provider](auth_token);

    if (!userInfo) {
      return reply.status(400).send({ error: "user.provider.invalidtoken" });
    }

    const { email } = userInfo;

    const userExist = await repo.findOne({ where: [{ username }, { email }] });
    if (userExist) {
      if (userExist.username === username) {
        return reply.status(400).send({ error: "user.username.taken" });
      }
      return reply.status(400).send({ error: "user.email.taken" });
    }

    const user = await repo.save({
      username,
      email,
      password: "",
      provider,
      role: 1,
      confirmed: 1,
    });

    user.favorites = [];
    user.contributions = [];

    user.jwt = await reply.jwtSign({
      id: user.id,
    });

    return user;
  },
};

const providerCallback = {
  schema: {
    summary: "Connect user with third party provider",
    tags: ["user"],
    params: S.object().prop("provider", S.string()),
    query: S.object().prop("auth_token", S.string()),
    response: {
      200: S.ref("userSchema"),
      400: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { provider } = req.params;
    const { auth_token } = req.query;

    if (!authProviders[provider]) {
      return reply.status(400).send({ error: "user.provider.invalidprovider" });
    }

    const userInfo = await authProviders[provider](auth_token);

    if (!userInfo) {
      return reply.status(400).send({ error: "user.provider.invalidtoken" });
    }

    const { email } = userInfo;

    const repo = req.server.db.getRepository(User);
    const user = await repo.findOne({
      where: { email },
      relations: ["favorites", "contributions"],
    });
    if (!user) {
      return reply.status(400).send({ error: "user.notfound" });
    }

    if (user.blocked) {
      return reply.status(400).send({ error: "user.blocked" });
    }

    user.provider = provider;
    user.jwt = await reply.jwtSign({
      id: user.id,
    });

    return user;
  },
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  providerRegister,
  providerCallback,
};
