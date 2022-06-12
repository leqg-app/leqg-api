const tap = require("tap");

const build = require("../mocks/build.js");
const loadTestResponses = require("../loadTestResponses.js");

const isEqualResponse = loadTestResponses(`${__dirname}/responses/rate.json`);

const fastify = build();
tap.teardown(() => fastify.close());

const context = {};

tap.test("Login 1", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/v2/auth/local",
    payload: { identifier: "auth", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt, contributions } = login.json();
  t.type(jwt, "string");

  context.jwt = jwt;
  context.contributions = contributions.length;
});

tap.test("Unavailable store", async (t) => {
  const { jwt } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/999/rate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      rate1: 5,
      rate2: 4,
      rate3: 4,
      comment: null,
      recommendedProducts: [],
    },
  });
  t.equal(response.statusCode, 404);
  isEqualResponse(response.json(), t.name);
});

tap.test("Missing required fields", async (t) => {
  const { jwt } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/999/rate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      rate2: 4,
      rate3: 4,
      comment: null,
      recommendedProducts: [],
    },
  });
  t.equal(response.statusCode, 400);
  isEqualResponse(response.json(), t.name);
});

tap.test("Rate store", async (t) => {
  const { jwt } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/rate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      rate1: 5,
      rate2: 4,
      rate3: 4,
      comment: null,
      recommendedProducts: [],
    },
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Store rate has been updated", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("User reputation was granted", async (t) => {
  const { jwt } = context;

  const response = await fastify.inject({
    url: "/v2/users/me",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });

  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Can't rate store twice", async (t) => {
  const { jwt } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/rate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      rate1: 5,
      rate2: 4,
      rate3: 4,
      comment: null,
      recommendedProducts: [],
    },
  });
  t.equal(response.statusCode, 400);
  isEqualResponse(response.json(), t.name);
});

tap.test("Store rate didn't change", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("User reputation is same", async (t) => {
  const { jwt } = context;

  const response = await fastify.inject({
    url: "/v2/users/me",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });

  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Login 2", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/v2/auth/local",
    payload: { identifier: "admin", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt, contributions } = login.json();
  t.type(jwt, "string");

  context.jwt2 = jwt;
  context.contributions2 = contributions.length;
});

tap.test("User 2 rate store", async (t) => {
  const { jwt2 } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/rate",
    headers: {
      authorization: `Bearer ${jwt2}`,
    },
    payload: {
      rate1: 4,
      rate2: 4,
      rate3: 4,
      comment: "Great store",
      recommendedProducts: [1],
    },
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Get store", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});
