const tap = require("tap");

const build = require("../mocks/build.js");
const loadTestResponses = require("../loadTestResponses.js");

const isEqualResponse = loadTestResponses(`${__dirname}/responses/auth.json`);

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Login", async (t) => {
  t.test("Success", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local",
      payload: { identifier: "admin", password: "azerty" },
    });

    t.equal(response.statusCode, 200);
    isEqualResponse(response.json(), `Login.${t.name}`);
  });

  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local",
      payload: { identifier: "user" },
    });
    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Login.${t.name}`);
  });

  t.test("Wrong username", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local",
      payload: { identifier: "wronguser", password: "azerty" },
    });
    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Login.${t.name}`);
  });

  t.test("Wrong password", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local",
      payload: { identifier: "admin", password: "wrongpassword" },
    });
    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Login.${t.name}`);
  });

  t.test("Blocked user", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local",
      payload: { identifier: "blocked", password: "azerty" },
    });
    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Login.${t.name}`);
  });

  t.test("Wrong provider", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local",
      payload: { identifier: "google", password: "azerty" },
    });
    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Login.${t.name}`);
  });
});

tap.test("Register", async (t) => {
  t.test("Success", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local/register",
      payload: { username: "user", password: "azerty", email: "user@leqg.app" },
    });

    t.equal(response.statusCode, 200);
    isEqualResponse(response.json(), `Register.${t.name}`);
  });

  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local/register",
      payload: {
        username: "user",
        password: "azerty",
      },
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Register.${t.name}`);
  });

  t.test("Already exist username", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local/register",
      payload: {
        username: "user",
        password: "azerty",
        email: "anotheruser@leqg.app",
      },
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Register.${t.name}`);
  });

  t.test("Already exist email", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local/register",
      payload: {
        username: "anotheruser",
        password: "azerty",
        email: "user@leqg.app",
      },
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Register.${t.name}`);
  });
});

tap.test("Forgot password", async (t) => {
  t.test("Success", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/forgot-password",
      payload: { email: "admin@leqg.app" },
    });

    t.equal(response.statusCode, 200);
    isEqualResponse(response.json(), `Forgot password.${t.name}`);
  });

  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/forgot-password",
      payload: {},
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Forgot password.${t.name}`);
  });

  t.test("User doesn't exist", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/forgot-password",
      payload: { email: "wrongmail@leqg.app" },
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Forgot password.${t.name}`);
  });

  t.test("Blocked user", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/forgot-password",
      payload: { email: "blocked@leqg.app" },
    });
    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Forgot password.${t.name}`);
  });

  t.test("Wrong provder", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/forgot-password",
      payload: { email: "google@leqg.app" },
    });
    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Forgot password.${t.name}`);
  });
});

tap.test("Reset password", async (t) => {
  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/reset-password",
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Reset password.${t.name}`);
  });

  t.test("Password mismatch", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/reset-password",
      payload: {
        code: "reset-code",
        password: "password",
        passwordConfirmation: "mismatch",
      },
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Reset password.${t.name}`);
  });

  t.test("Expired reset code", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/reset-password",
      payload: {
        code: "expired-reset-code",
        password: "password",
        passwordConfirmation: "password",
      },
    });

    t.equal(response.statusCode, 400);
    isEqualResponse(response.json(), `Reset password.${t.name}`);
  });

  t.test("Success", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/reset-password",
      payload: {
        code: "reset-code",
        password: "password",
        passwordConfirmation: "password",
      },
    });

    t.equal(response.statusCode, 200);
    isEqualResponse(response.json(), `Reset password.${t.name}`);
  });

  t.test("Could login with new password", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/v2/auth/local",
      payload: { identifier: "admin", password: "password" },
    });

    t.equal(response.statusCode, 200);
    isEqualResponse(response.json(), `Reset password.${t.name}`);
  });
});
