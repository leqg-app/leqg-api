const tap = require("tap");

const build = require("../../mocks/build.js");
const loadTestResponses = require("../../loadTestResponses.js");

const isEqualResponse = loadTestResponses(
  `${__dirname}/../responses/stores-get.json`
);

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all", async (t) => {
  const response = await fastify.inject("/v1/stores");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Unavailable store", async (t) => {
  const response = await fastify.inject("/v1/stores/999");
  t.equal(response.statusCode, 404);
  isEqualResponse(response.json(), t.name);
});

tap.test("Get one", async (t) => {
  const response = await fastify.inject("/v1/stores/1");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});
