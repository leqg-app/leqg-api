const tap = require("tap");

const build = require("../mocks/build.js");

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all stores", async (t) => {
  const response = await fastify.inject("/v1/stores");
  t.equal(response.statusCode, 200);
  t.equal(response.json().length, 2);
});

tap.test("Get a store", async () => {
  tap.test("Unavailable store", async (t) => {
    const response = await fastify.inject("/v1/stores/999");
    t.equal(response.statusCode, 404);
  });

  tap.test("Get store", async (t) => {
    const response = await fastify.inject("/v1/stores/1");
    t.equal(response.statusCode, 200);
    const { name, address } = response.json();
    t.equal(name, "Store 1");
    t.equal(address, "Address 1");
  });
});
