const tap = require("tap");

const build = require("./mocks/build.js");

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Login", async (t) => {
  t.test("Success", async (t) => {
    t.plan(3);

    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "admin", password: "azerty" },
    });

    t.equal(response.statusCode, 200);
    t.type(response.json().jwt, "string");
    t.same(response.json().user, {
      username: "admin",
      email: "admin@leqg.app",
      favorites: [],
      contributions: 0,
    });
  });

  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "user" },
    });
    t.equal(response.statusCode, 400);
  });

  t.test("Wrong username", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "wronguser", password: "azerty" },
    });
    t.equal(response.statusCode, 400);
  });

  t.test("Wrong password", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "admin", password: "wrongpassword" },
    });
    t.equal(response.statusCode, 400);
  });

  t.test("Blocked user", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "blocked", password: "azerty" },
    });
    t.equal(response.statusCode, 400);
  });

  t.test("Wrong provder", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "google", password: "azerty" },
    });
    t.equal(response.statusCode, 400);
  });
});

tap.test("Register", async (t) => {
  t.test("Success", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local/register",
      payload: { username: "user", password: "azerty", email: "user@leqg.app" },
    });

    t.equal(response.statusCode, 200);
  });

  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local/register",
      payload: {
        username: "user",
        password: "azerty",
      },
    });

    t.equal(response.statusCode, 400);
  });

  t.test("Already exist username", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local/register",
      payload: {
        username: "user",
        password: "azerty",
        email: "anotheruser@leqg.app",
      },
    });

    t.equal(response.statusCode, 400);
  });

  t.test("Already exist email", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local/register",
      payload: {
        username: "anotheruser",
        password: "azerty",
        email: "user@leqg.app",
      },
    });

    t.equal(response.statusCode, 400);
  });
});

tap.test("Forgot password", async (t) => {
  t.test("Success", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: "user@leqg.app" },
    });

    t.equal(response.statusCode, 200);
  });

  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: {},
    });

    t.equal(response.statusCode, 400);
  });

  t.test("User doesn't exist", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: "wrongmail@leqg.app" },
    });

    t.equal(response.statusCode, 400);
  });

  t.test("Blocked user", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: "blocked@leqg.app" },
    });
    t.equal(response.statusCode, 400);
  });

  t.test("Wrong provder", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: "google@leqg.app" },
    });
    t.equal(response.statusCode, 400);
  });
});

tap.test("Reset password", async (t) => {
  t.test("Miss field", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/reset-password",
    });

    t.equal(response.statusCode, 400);
  });

  t.test("Password mismatch", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        code: "reset-code",
        password: "password",
        passwordConfirmation: "mismatch",
      },
    });

    t.equal(response.statusCode, 400);
  });

  t.test("Expired reset code", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        code: "expired-reset-code",
        password: "password",
        passwordConfirmation: "password",
      },
    });

    t.equal(response.statusCode, 400);
  });

  t.test("Success", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        code: "reset-code",
        password: "password",
        passwordConfirmation: "password",
      },
    });

    t.equal(response.statusCode, 200);
  });

  t.test("Could login with new password", async (t) => {
    const response = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "admin", password: "password" },
    });

    t.equal(response.statusCode, 200);
  });
});
