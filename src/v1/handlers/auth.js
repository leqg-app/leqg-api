import S from "fluent-json-schema";
import crypto from "crypto";

import { User } from "../../entity/index.js";
import { errorSchema, formatError } from "../responses/error.js";
import { hashPassword } from "../utils/password.js";

const login = {
  schema: {
    summary: "Authenticate user",
    body: S.object()
      .prop("identifier", S.string().required())
      .prop("password", S.string().required()),
    response: {
      200: S.object()
        .prop("username", S.string())
        .prop("email", S.string())
        .prop("contributions", S.integer()),
      400: errorSchema(),
    },
  },
  handler: async (req, rep) => {
    const { identifier, password } = req.body;
    const repo = req.server.db.getRepository(User);
    const user = await repo.findOneBy({ username: identifier });

    if (!user) {
      return reply.status(400).send(formatError("Auth.form.error.invalid"));
    }

    if (user.blocked) {
      return reply.status(400).send(formatError("Auth.form.error.blocked"));
    }

    if (user.provider !== "local") {
      return reply
        .status(400)
        .send(formatError("Auth.form.error.password.local"));
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.status(400).send(formatError("Auth.form.error.invalid"));
    }

    return user;
  },
};

const register = {
  schema: {
    summary: "Register user",
    body: S.object()
      .prop("username", S.string().required())
      .prop("password", S.string().required())
      .prop("email", S.string().format(S.FORMATS.EMAIL).required()),
    response: {
      200: S.object()
        .prop("username", S.string())
        .prop("email", S.string())
        .prop("contributions", S.integer()),
      400: errorSchema(),
    },
  },
  errorHandler: (error, req, reply) => {
    if (!error.validation) {
      return reply.status(400).send(formatError(error.message));
    }
    const [{ params }] = error.validation;

    const message = {
      email: "Auth.form.error.email.provide",
      password: "Auth.form.error.password.provide",
    }[params.missingProperty || params.format];

    reply.status(400).send(formatError(message));
  },
  handler: async (req, reply) => {
    const { username, password, email } = req.body;
    const repo = req.server.db.getRepository(User);

    const user = await repo.findOne({ where: [{ username }, { email }] });
    if (user) {
      if (user.username === username) {
        return reply
          .status(400)
          .send(formatError("Auth.form.error.username.taken"));
      }
      if (user.email === email) {
        return reply
          .status(400)
          .send(formatError("Auth.form.error.email.taken"));
      }
    }

    const hashedPassword = await hashPassword(password);
    return repo.save({
      username,
      email,
      password: hashedPassword,
      provider: "local",
      role: 1,
      confirmed: 1,
    });
  },
};

const forgotPassword = {
  schema: {
    summary: "Send mail to reset password",
    body: S.object().prop(
      "email",
      S.string().format(S.FORMATS.EMAIL).required()
    ),
    response: {
      200: S.object().prop("statusCode", S.integer()),
      400: errorSchema(),
    },
  },
  errorHandler: (error, req, reply) => {
    if (!error.validation) {
      return reply.status(400).send(formatError(error.message));
    }
    const [{ params }] = error.validation;

    const message = {
      email: "Auth.form.error.email.format",
    }[params.missingProperty || params.format];

    reply.status(400).send(formatError(message));
  },
  handler: async (req, reply) => {
    const { email } = req.body;
    const repo = req.server.db.getRepository(User);

    const user = await repo.findOneBy({ email });
    if (!user) {
      return reply
        .status(400)
        .send(formatError("Auth.form.error.user.not-exist"));
    }

    if (user.blocked) {
      return reply.status(400).send(formatError("Auth.form.error.blocked"));
    }

    if (user.provider !== "local") {
      return reply
        .status(400)
        .send(formatError("Auth.form.error.password.local"));
    }

    const resetPasswordToken = crypto.randomBytes(64).toString("hex");

    user.resetPasswordToken = resetPasswordToken;
    await repo.update(user.id, user);

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
    body: S.object()
      .prop("code", S.string().required())
      .prop("password", S.string().required())
      .prop("passwordConfirmation", S.string().required()),
    response: {
      200: S.object().prop("statusCode", S.integer()),
    },
  },
  handler: async (req, reply) => {
    const { code, password, passwordConfirmation } = req.body;

    if (password !== passwordConfirmation) {
      return reply
        .status(400)
        .send(formatError("Auth.form.error.password.matching"));
    }

    const repo = req.server.db.getRepository(User);

    const user = await repo.findOneBy({ resetPasswordToken: code });
    if (!user) {
      return reply
        .status(400)
        .send(formatError("Auth.form.error.code.provide"));
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = null;
    await repo.update(user.id, user);

    return { statusCode: 200 };
  },
};

export { login, register, forgotPassword, resetPassword };
