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
    url: "/auth/local",
    payload: { identifier: "admin", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt, user } = login.json();
  t.type(jwt, "string");

  context.jwt = jwt;
  context.contributions = user.contributions;
});

tap.test("Check versions", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, context.version);
});

tap.test("Create a store", async () => {
  tap.test("Create store", async (t) => {
    const { jwt } = context;

    const create = await fastify.inject({
      method: "POST",
      url: "/v2/stores",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
      payload: {
        name: "Store 3",
        address: "Address 3",
        longitude: 1,
        latitude: 1,
        products: [
          {
            productName: "the beer",
            price: 2,
            volume: 50,
            type: "draft",
          },
        ],
      },
    });

    t.equal(create.statusCode, 200);
  });

  tap.test("Get created store", async (t) => {
    const response = await fastify.inject("/v2/stores/3");
    t.equal(response.statusCode, 200);
    t.equal(response.json().name, "Store 3");
    t.equal(response.json().address, "Address 3");
  });

  tap.test("Check versions", async (t) => {
    const response = await fastify.inject("/v1/version");
    t.equal(response.statusCode, 200);
    t.equal(response.json().stores, ++context.version);
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
    t.equal(profile.json().contributions, ++context.contributions);
  });
});
