const tap = require("tap");

const build = require("./mocks/build.js");

tap.test("Health", async (t) => {
  const fastify = build();

  t.teardown(() => fastify.close());

  const response = await fastify.inject({
    method: "GET",
    url: "/",
  });
  t.equal(response.statusCode, 200);
});
