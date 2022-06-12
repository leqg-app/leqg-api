const tap = require("tap");

const build = require("../../mocks/build.js");
const loadTestResponses = require("../../loadTestResponses.js");

const isEqualResponse = loadTestResponses(
  `${__dirname}/../responses/stores-get.json`
);

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all stores", async (t) => {
  const response = await fastify.inject("/v2/stores");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Unavailable store", async (t) => {
  const response = await fastify.inject("/v2/stores/999");
  t.equal(response.statusCode, 404);
  isEqualResponse(response.json(), t.name);
});

tap.test("Get store", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});
