const tap = require("tap");

const build = require("../../mocks/build.js");

const fastify = build();
tap.teardown(() => fastify.close());

let context = {
  version: 1,
};

tap.test("Login 1", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/auth/local",
    payload: { identifier: "admin", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt, user } = login.json();
  t.type(jwt, "string");

  context.jwt = jwt;
  context.reputation = user.reputation;
  context.contributions = user.contributions;
});

tap.test("Check versions", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, context.version);
});

tap.test("Get store", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 200);

  const store = response.json();
  t.equal(store.name, "Store 1");
  t.equal(store.address, "Address 1");

  context.store = store;
});

tap.test("Miss fields to validate", async (t) => {
  t.plan(1);
  const { jwt } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/validate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });
  t.equal(response.statusCode, 400);
});

tap.test("Don't validate unavailable store", async (t) => {
  t.plan(2);
  const { jwt, store } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/999/validate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      latitude: store.latitude,
      longitude: store.longitude,
    },
  });
  t.equal(response.statusCode, 404);
  t.equal(response.json().error, "store.notfound");
});

tap.test("Position too far from store", async (t) => {
  t.plan(2);
  const { jwt, store } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/validate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      latitude: store.latitude,
      longitude: store.longitude + 0.001, // + ~100m
    },
  });
  t.equal(response.statusCode, 422);
  t.equal(response.json().error, "store.validation.position");
});

tap.test("Validate store", async (t) => {
  const { jwt, store } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/validate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      latitude: store.latitude,
      longitude: store.longitude + 0.0001, // + ~10m
    },
  });
  t.equal(response.statusCode, 200);
});

tap.test("User 1 reputation should be granted", async (t) => {
  const { jwt } = context;

  const profile = await fastify.inject({
    url: "/users/me",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });

  t.equal(profile.statusCode, 200);
  t.equal(profile.json().contributions, ++context.contributions);
  t.equal(profile.json().reputation, (context.reputation += 2));
});

tap.test("Can't validate store twice", async (t) => {
  const { jwt, store } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/validate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      latitude: store.latitude,
      longitude: store.longitude + 0.0001, // + ~10m
    },
  });
  t.equal(response.statusCode, 422);
});

tap.test("Can't validate another store before some time", async (t) => {
  const { jwt, store } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/2/validate",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: {
      latitude: store.latitude,
      longitude: store.longitude + 0.0001, // + ~10m
    },
  });
  t.equal(response.statusCode, 429);
});

tap.test("Login 2", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/auth/local",
    payload: { identifier: "auth", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt } = login.json();
  t.type(jwt, "string");

  context.jwt2 = jwt;
});

tap.test("Validate store with another user", async (t) => {
  const { jwt2, store } = context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v2/stores/1/validate",
    headers: {
      authorization: `Bearer ${jwt2}`,
    },
    payload: {
      latitude: store.latitude,
      longitude: store.longitude + 0.0001, // + ~10m
    },
  });
  t.equal(response.statusCode, 200);
});

tap.test("Creator reputation should be granted", async (t) => {
  const { jwt } = context;

  const profile = await fastify.inject({
    url: "/users/me",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });

  t.equal(profile.statusCode, 200);
  t.equal(profile.json().contributions, ++context.contributions);
  t.equal(profile.json().reputation, (context.reputation += 6));
});
