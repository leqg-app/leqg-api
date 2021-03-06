const tap = require("tap");

const build = require("../mocks/build.js");
const loadTestResponses = require("../loadTestResponses.js");

const isEqualResponse = loadTestResponses(
  `${__dirname}/responses/reputation.json`
);

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Login user 1", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/auth/local",
    payload: { identifier: "admin", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt, user } = login.json();
  t.type(jwt, "string");

  tap.context.jwt1 = jwt;
  tap.context.contributions1 = user.contributions;
  tap.context.reputation1 = user.reputation;
});

tap.test("Login user 2", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/auth/local",
    payload: { identifier: "auth", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt } = login.json();
  t.type(jwt, "string");

  tap.context.jwt2 = jwt;
});

tap.test("Create store with user 1", async (t) => {
  const { jwt1 } = tap.context;
  const response = await fastify.inject({
    method: "POST",
    url: "/v1/stores",
    headers: {
      authorization: `Bearer ${jwt1}`,
    },
    payload: {
      name: "Store 3",
      address: "Address 3",
      longitude: 1,
      latitude: 1,
      products: [
        { productName: "the beer", price: 2, volume: 50, type: "draft" },
        { productName: "beer 2", price: 3, volume: 50, type: "draft" },
      ],
      schedules: new Array(7)
        .fill()
        .map((_, i) => ({ dayOfWeek: i + 1, closed: false })),
    },
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
  tap.context.store = response.json();
});

tap.test("User 1 reputation was granted", async (t) => {
  const { jwt1 } = tap.context;

  const response = await fastify.inject({
    url: "/users/me",
    headers: {
      authorization: `Bearer ${jwt1}`,
    },
  });

  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Update store with user 1 shouldn't contribute", async (t) => {
  const { jwt1, store } = tap.context;
  store.name = "Store updated";
  const response = await fastify.inject({
    method: "PUT",
    url: "/v1/stores/3",
    headers: {
      authorization: `Bearer ${jwt1}`,
    },
    payload: store,
  });
  tap.context.store = response.json().store;
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("User 1 reputation should be the same", async (t) => {
  const { jwt1 } = tap.context;

  const response = await fastify.inject({
    url: "/users/me",
    headers: {
      authorization: `Bearer ${jwt1}`,
    },
  });

  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Update product 1 with user 2 should contribute", async (t) => {
  const { jwt2, store } = tap.context;
  store.products[0].productName = "beer user 2";
  const response = await fastify.inject({
    method: "PUT",
    url: "/v1/stores/3",
    headers: {
      authorization: `Bearer ${jwt2}`,
    },
    payload: store,
  });
  tap.context.store = response.json().store;
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Update product 1 with user 1 should contribute again", async (t) => {
  const { jwt1, store } = tap.context;
  store.name = "Best Store!";
  store.products[0].productName = "beer user 1";
  const response = await fastify.inject({
    method: "PUT",
    url: "/v1/stores/3",
    headers: {
      authorization: `Bearer ${jwt1}`,
    },
    payload: store,
  });
  tap.context.store = response.json().store;
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});
