import tap from "tap";

import build from "../../src/app.js";

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all features", async (t) => {
  const response = await fastify.inject("/v1/features");
  t.equal(response.statusCode, 200);
});
