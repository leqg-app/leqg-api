const tap = require("tap");

const build = require("../../mocks/build.js");
const loadTestResponses = require("../../loadTestResponses.js");

const isEqualResponse = loadTestResponses(
  `${__dirname}/../responses/stores-update.json`
);

const fastify = build();
tap.teardown(() => fastify.close());

let context = {
  version: 1,
};

tap.test("Login", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/v2/auth/local",
    payload: { identifier: "auth", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt } = login.json();
  t.type(jwt, "string");

  context.jwt = jwt;
});

tap.test("Check versions", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, context.version);
});

tap.test("Get store", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);

  context.store = response.json();
});

tap.test("Miss fields", async (t) => {
  const { jwt } = context;
  const response = await fastify.inject({
    method: "PUT",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });
  t.equal(response.statusCode, 400);
  isEqualResponse(response.json(), t.name);
});

tap.test("Can't update unavailable store", async (t) => {
  const { jwt, store } = context;
  const response = await fastify.inject({
    method: "PUT",
    url: "/v2/stores/999",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: store,
  });
  t.equal(response.statusCode, 404);
  isEqualResponse(response.json(), t.name);
});

tap.test("Update store without contribution", async (t) => {
  const { jwt, store } = context;
  const response = await fastify.inject({
    method: "PUT",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: store,
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Check not-upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, context.version);
});

tap.test("Update store name", async (t) => {
  const { jwt, store } = context;
  store.name = "Store updated";
  const response = await fastify.inject({
    method: "PUT",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: store,
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Check upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, ++context.version);
});

tap.test("Check incremented user contribution", async (t) => {
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

tap.test("Update store to add product", async (t) => {
  const { jwt, store } = context;
  store.products.push({
    productName: "my favorite beer",
    price: 1,
    volume: 50,
    type: "draft",
  });
  const response = await fastify.inject({
    method: "PUT",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: store,
  });
  context.store = response.json().store;
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Check upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, ++context.version);
});

tap.test("Update added product should not add reputation", async (t) => {
  const { jwt, store } = context;
  store.products[store.products.length - 1].productName = "not favorite beer";
  const response = await fastify.inject({
    method: "PUT",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: store,
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Check upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, ++context.version);
});

tap.test("Update store with no contribution param", async (t) => {
  const { jwt, store } = context;
  store.name = "Updated store again";
  const response = await fastify.inject({
    method: "PUT",
    url: "/v2/stores/1?contribution=false",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
    payload: store,
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Check upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, ++context.version);
});
