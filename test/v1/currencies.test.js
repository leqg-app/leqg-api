const tap = require("tap");

const build = require("./mocks/build.js");

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all currencies rates", async (t) => {
  const response = await fastify.inject("/v1/currencies");
  t.equal(response.statusCode, 200);
});
