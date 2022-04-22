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
      return formatError("Auth.form.error.invalid");
    }

    if (user.blocked) {
      return formatError("Auth.form.error.blocked");
    }

    if (user.provider !== "local") {
      return formatError("Auth.form.error.password.local");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return formatError("Auth.form.error.invalid");
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
      200: S.object(),
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
  handler: async (req, rep) => {
    const { email } = req.body;
    const repo = req.server.db.getRepository(User);

    const user = await repo.findOneBy({ email });
    if (!user) {
      return reply
        .status(400)
        .send(formatError("Auth.form.error.user.not-exist"));
    }

    if (user.blocked) {
      return formatError("Auth.form.error.blocked");
    }

    if (user.provider !== "local") {
      return formatError("Auth.form.error.password.local");
    }

    const resetPasswordToken = crypto.randomBytes(64).toString("hex");

    user.resetPasswordToken = resetPasswordToken;
    await repo.update(user.id, user);

    await req.server.email.send({
      to: user.email,
      subject: "Réinitialisez votre mot de passe",
      html: `${user.username},\n\nCliquez sur ce lien pour réinitialiser votre mot de passe: https://leqg.app/reset-password/?token=${resetPasswordToken}`,
      text: `${user.username},\n\nCliquez sur ce lien pour réinitialiser votre mot de passe: https://leqg.app/reset-password/?token=${resetPasswordToken}`,
    });

    return {};
  },
};

const resetPassword = {
  schema: {
    summary: "Reset user password",
    response: {
      200: S.object(), // TODO
    },
  },
  handler: async (req, rep) => {
    // TODO
    return {};
  },
};

export { login, register, forgotPassword, resetPassword };
