const tap = require("tap");

const build = require("../../mocks/build.js");
const loadTestResponses = require("../../loadTestResponses.js");

const isEqualResponse = loadTestResponses(
  `${__dirname}/../responses/stores-delete.json`
);

const fastify = build();
tap.teardown(() => fastify.close());

let context = {
  version: 1,
};

tap.test("Login user", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/v2/auth/local",
    payload: { identifier: "auth", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt } = login.json();
  t.type(jwt, "string");

  context.jwtUser = jwt;
});

tap.test("Check versions", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, context.version);
});

tap.test("Get store", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);

  context.store = response.json();
});

tap.test("Unauthorized", async (t) => {
  const { jwtUser } = context;
  const response = await fastify.inject({
    method: "DELETE",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwtUser}`,
    },
  });
  t.equal(response.statusCode, 401);
  isEqualResponse(response.json(), t.name);
});

tap.test("Login admin", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/v2/auth/local",
    payload: { identifier: "admin", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt } = login.json();
  t.type(jwt, "string");

  context.jwtAdmin = jwt;
});

tap.test("Success", async (t) => {
  const { jwtAdmin } = context;
  const response = await fastify.inject({
    method: "DELETE",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwtAdmin}`,
    },
  });
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Can't delete store anymore", async (t) => {
  const { jwtAdmin } = context;
  const response = await fastify.inject({
    method: "DELETE",
    url: "/v2/stores/1",
    headers: {
      authorization: `Bearer ${jwtAdmin}`,
    },
  });
  t.equal(response.statusCode, 404);
  isEqualResponse(response.json(), t.name);
});

tap.test("Can't get store anymore", async (t) => {
  const response = await fastify.inject("/v2/stores/1");
  t.equal(response.statusCode, 404);
  isEqualResponse(response.json(), t.name);

  context.store = response.json();
});

tap.test("Check store versionned", async (t) => {
  const { version } = context;
  const response = await fastify.inject(
    `/v2/stores/versions/${version}..${version + 1}`
  );
  t.equal(response.statusCode, 200);
  isEqualResponse(response.json(), t.name);
});

tap.test("Check upgraded version", async (t) => {
  const response = await fastify.inject("/v1/version");
  t.equal(response.statusCode, 200);
  t.equal(response.json().stores, ++context.version);
});
