const tap = require("tap");
const { createSigner } = require("fast-jwt");
const signSync = createSigner({ key: process.env.JWT_SECRET });

const build = require("../mocks/build.js");
const loadTestResponses = require("../loadTestResponses.js");

const isEqualResponse = loadTestResponses(`${__dirname}/responses/user.json`);

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Profile", async ({ context }) => {
  tap.test("Login", async (t) => {
    const login = await fastify.inject({
      method: "POST",
      url: "/auth/local",
      payload: { identifier: "admin", password: "azerty" },
    });
    t.equal(login.statusCode, 200);

    const { jwt } = login.json();
    t.type(jwt, "string");
    context.jwt = jwt;
  });

  tap.test("Get user profile", async (t) => {
    const { jwt } = context;

    const response = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });

    t.equal(response.statusCode, 200);
    isEqualResponse(response.json(), t.name);
  });

  tap.test("Invalid jwt", async (t) => {
    const response = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer invalidJwt`,
      },
    });

    t.equal(response.statusCode, 401);
    isEqualResponse(response.json(), t.name);
  });

  tap.test("Blocked jwt", async (t) => {
    const response = await fastify.inject({
      url: "/users/me",
      headers: {
        // valid jwt with blocked user
        authorization: `Bearer ${signSync({ id: 3 })}`,
      },
    });

    t.equal(response.statusCode, 401);
    isEqualResponse(response.json(), t.name);
  });

  tap.test("Add favorite store to user", async (t) => {
    const { jwt } = context;

    const update = await fastify.inject({
      method: "PUT",
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
      payload: { favorites: [1] },
    });
    t.equal(update.statusCode, 200);
    isEqualResponse(update.json(), t.name);

    const response = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });

    t.equal(response.statusCode, 200);
    isEqualResponse(response.json(), `${t.name}-2`);
  });
});
