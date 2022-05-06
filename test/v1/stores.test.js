const tap = require("tap");

const build = require("./mocks/build.js");

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all stores", async (t) => {
  const response = await fastify.inject("/v1/stores");
  t.equal(response.statusCode, 200);
  t.equal(response.json().length, 2);
});

tap.test("Get one store", async (t) => {
  const response = await fastify.inject("/v1/stores/1");
  t.equal(response.statusCode, 200);
  const { name, address } = response.json();
  t.equal(name, "Store 1");
  t.equal(address, "Address 1");
});

tap.test("Create store", async ({ context }) => {
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

  tap.test("Create store", async (t) => {
    const { jwt } = context;
    const login = await fastify.inject({
      method: "POST",
      url: "/v1/stores",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
      payload: {
        name: "Store 3",
        address: "Address 3",
        longitude: 1,
        latitude: 1,
      },
    });
    t.equal(login.statusCode, 200);
  });

  tap.test("Check versions", async (t) => {
    const response = await fastify.inject("/v1/version");
    t.equal(response.statusCode, 200);
    t.equal(response.json().stores, 2);
  });

  tap.test("Check incremented user contribution", async (t) => {
    const { jwt } = context;

    const profile = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });

    t.equal(profile.statusCode, 200);
    t.equal(profile.json().contributions, 1);
  });
});

tap.test("Update store", async ({ context }) => {
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

  tap.test("Get one store", async (t) => {
    const response = await fastify.inject("/v1/stores/1");
    t.equal(response.statusCode, 200);
    const store = response.json();
    context.store = store;
    t.equal(store.name, "Store 1");
    t.equal(store.address, "Address 1");
  });

  tap.test("Miss fields", async (t) => {
    const { jwt, store } = context;
    const response = await fastify.inject({
      method: "PUT",
      url: "/v1/stores/1",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });
    t.equal(response.statusCode, 400);
  });

  tap.test("Don't update unavailable store", async (t) => {
    t.plan(1);
    const { jwt, store } = context;
    const response = await fastify.inject({
      method: "PUT",
      url: "/v1/stores/999",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
      payload: store,
    });
    t.equal(response.statusCode, 404);
  });

  tap.test("Update store with no contribution", async (t) => {
    const { jwt, store } = context;
    const response = await fastify.inject({
      method: "PUT",
      url: "/v1/stores/1",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
      payload: store,
    });
    t.equal(response.statusCode, 200);
    t.same(response.json().store, store);
    t.equal(response.json().contributed, false);
  });

  tap.test("Check not-upgraded version", async (t) => {
    const response = await fastify.inject("/v1/version");
    t.equal(response.statusCode, 200);
    t.equal(response.json().stores, 2);
  });

  tap.test("Update store", async (t) => {
    const { jwt, store } = context;
    store.name = "Store updated";
    const response = await fastify.inject({
      method: "PUT",
      url: "/v1/stores/1",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
      payload: store,
    });
    t.equal(response.statusCode, 200);
    t.equal(response.json().store.name, "Store updated");
    t.equal(response.json().contributed, true);
  });

  tap.test("Check upgraded version", async (t) => {
    const response = await fastify.inject("/v1/version");
    t.equal(response.statusCode, 200);
    t.equal(response.json().stores, 3);
  });

  tap.test("Check incremented user contribution", async (t) => {
    const { jwt } = context;

    const profile = await fastify.inject({
      url: "/users/me",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });

    t.equal(profile.statusCode, 200);
    t.equal(profile.json().contributions, 2);
  });
});
