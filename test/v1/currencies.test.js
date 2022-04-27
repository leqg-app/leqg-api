import tap from "tap";

import build from "../../src/app.js";

const fastify = build();
tap.teardown(() => fastify.close());

tap.test("Get all currencies rates", async (t) => {
  const response = await fastify.inject("/v1/currencies");
  t.equal(response.statusCode, 200);
});
