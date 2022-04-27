import tap from "tap";

import build from "../src/app.js";

tap.test("GET `/` route", async (t) => {
  const fastify = build();

  t.teardown(() => fastify.close());

  const response = await fastify.inject({
    method: "GET",
    url: "/",
  });
  t.equal(response.statusCode, 200);
});
