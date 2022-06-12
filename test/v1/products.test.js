const tap = require("tap");

const build = require("../mocks/build.js");
const loadTestResponses = require("../loadTestResponses.js");

const isEqualResponse = loadTestResponses(
  `${__dirname}/responses/products.json`
);

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all products", async (t) => {
  const response = await fastify.inject("/v1/products");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});
