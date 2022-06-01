const tap = require("tap");

const build = require("../../mocks/build.js");

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

  const store = response.json();
  t.equal(store.name, "Store 1");
  t.equal(store.address, "Address 1");

  context.store = store;
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
});

tap.test("Can't update unavailable store", async (t) => {
  t.plan(1);
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
  t.equal(response.json().reputation.total, 0);
  t.equal(response.json().reputation.fields.length, 0);
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
  t.equal(response.json().store.name, "Store updated");
  t.equal(response.json().reputation.total, 2);
  t.equal(response.json().reputation.fields.length, 1);
  t.same(response.json().reputation, {
    total: 2,
    fields: [{ reputation: 2, fieldName: "name" }],
  });
});

tap.test("Check upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, ++context.version);
});

tap.test("Check incremented user contribution", async (t) => {
  const { jwt } = context;

  const profile = await fastify.inject({
    url: "/v2/users/me",
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });

  t.equal(profile.statusCode, 200);
  t.equal(profile.json().contributions.length, 2);
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
  t.equal(response.json().store.products.length, store.products.length);
  t.equal(response.json().reputation.total, 5);
  t.equal(response.json().reputation.fields.length, 1);
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
  t.equal(response.json().store.products.length, store.products.length);
  t.equal(response.json().reputation.total, 0);
  t.equal(response.json().reputation.fields.length, 0);
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
  t.equal(response.json().reputation.total, 0);
  t.equal(response.json().reputation.fields.length, 0);
});

tap.test("Check upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, ++context.version);
});
