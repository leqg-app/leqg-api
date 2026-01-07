const tap = require("tap");
const FormData = require("form-data");
const build = require("../mocks/build.js");

const fastify = build();
tap.teardown(() => fastify.close());

let context = {};

tap.test("Login", async (t) => {
  const login = await fastify.inject({
    method: "POST",
    url: "/v2/auth/local",
    payload: { identifier: "admin", password: "azerty" },
  });
  t.equal(login.statusCode, 200);

  const { jwt } = login.json();
  t.type(jwt, "string");

  context.jwt = jwt;
});

// Helper to create a test image file
function createTestImageBuffer() {
  // Create a simple 1x1 PNG image buffer
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
}

tap.test("POST /v2/stores/:id/photos", async (t) => {
  t.test("should add a photo to a store", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser",
      email: "photouser@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store",
      address: "Test Address",
      longitude: 1.0,
      latitude: 1.0,
    });

    const token = fastify.jwt.sign({ id: user.id });

    const form = new FormData();
    form.append("image", createTestImageBuffer(), {
      filename: "test-photo.png",
      contentType: "image/png",
    });
    form.append("caption", "Belle terrasse");

    const response = await fastify.inject({
      method: "POST",
      url: `/v2/stores/${store.id}/photos`,
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form,
    });

    t.equal(response.statusCode, 200);
    const json = response.json();
    t.ok(json.photo);
    t.ok(json.photo.url.startsWith("/uploads/"));
    t.equal(json.photo.caption, "Belle terrasse");
    t.equal(json.photo.user.id, user.id);
    t.ok(json.reputation);
    t.equal(json.reputation.total, 20);
    t.equal(json.reputation.reason, "store.photo.creation");
  });

  t.test("should add a photo without caption", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser2",
      email: "photouser2@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 2",
      address: "Test Address 2",
      longitude: 1.0,
      latitude: 1.0,
    });

    const token = fastify.jwt.sign({ id: user.id });

    const form = new FormData();
    form.append("image", createTestImageBuffer(), {
      filename: "test-photo2.png",
      contentType: "image/png",
    });

    const response = await fastify.inject({
      method: "POST",
      url: `/v2/stores/${store.id}/photos`,
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form,
    });

    t.equal(response.statusCode, 200);
    const json = response.json();
    t.ok(json.photo);
    t.ok(json.photo.url.startsWith("/uploads/"));
    t.equal(json.photo.caption, null);
    t.equal(json.photo.product, null);
  });

  t.test("should add a photo with a product", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser2b",
      email: "photouser2b@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 2b",
      address: "Test Address 2b",
      longitude: 1.0,
      latitude: 1.0,
    });
    const product = await fastify.db.manager.save("Product", {
      name: "Test Beer",
      type: "beer",
    });

    const token = fastify.jwt.sign({ id: user.id });

    const form = new FormData();
    form.append("image", createTestImageBuffer(), {
      filename: "test-photo2b.png",
      contentType: "image/png",
    });
    form.append("caption", "Photo de la bière");
    form.append("productId", product.id.toString());

    const response = await fastify.inject({
      method: "POST",
      url: `/v2/stores/${store.id}/photos`,
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form,
    });

    t.equal(response.statusCode, 200);
    const json = response.json();
    t.ok(json.photo);
    t.ok(json.photo.url.startsWith("/uploads/"));
    t.equal(json.photo.caption, "Photo de la bière");
    t.ok(json.photo.product);
    t.equal(json.photo.product.id, product.id);
    t.equal(json.photo.product.name, "Test Beer");
  });

  t.test("should return 404 if product not found", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser2c",
      email: "photouser2c@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 2c",
      address: "Test Address 2c",
      longitude: 1.0,
      latitude: 1.0,
    });

    const token = fastify.jwt.sign({ id: user.id });

    const form = new FormData();
    form.append("image", createTestImageBuffer(), {
      filename: "test-photo2c.png",
      contentType: "image/png",
    });
    form.append("productId", "99999");

    const response = await fastify.inject({
      method: "POST",
      url: `/v2/stores/${store.id}/photos`,
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form,
    });

    t.equal(response.statusCode, 404);
    t.same(response.json(), { error: "product.notfound" });
  });

  t.test("should return 404 if store not found", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser3",
      email: "photouser3@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const token = fastify.jwt.sign({ id: user.id });

    const form = new FormData();
    form.append("image", createTestImageBuffer(), {
      filename: "test-photo.png",
      contentType: "image/png",
    });

    const response = await fastify.inject({
      method: "POST",
      url: "/v2/stores/99999/photos",
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form,
    });

    t.equal(response.statusCode, 404);
    t.same(response.json(), { error: "store.notfound" });
  });

  t.test("should return 401 if not authenticated", async (t) => {
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 3",
      address: "Test Address 3",
      longitude: 1.0,
      latitude: 1.0,
    });

    const form = new FormData();
    form.append("image", createTestImageBuffer(), {
      filename: "test-photo.png",
      contentType: "image/png",
    });

    const response = await fastify.inject({
      method: "POST",
      url: `/v2/stores/${store.id}/photos`,
      headers: form.getHeaders(),
      payload: form,
    });

    t.equal(response.statusCode, 401);
  });

  t.test("should return 400 if no file provided", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser4",
      email: "photouser4@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 4",
      address: "Test Address 4",
      longitude: 1.0,
      latitude: 1.0,
    });
    const token = fastify.jwt.sign({ id: user.id });

    const response = await fastify.inject({
      method: "POST",
      url: `/v2/stores/${store.id}/photos`,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "multipart/form-data",
      },
      payload: {},
    });

    t.equal(response.statusCode, 400);
    t.same(response.json(), { error: "photo.file.required" });
  });

  t.test("should return 400 if invalid file type", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser5",
      email: "photouser5@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 5",
      address: "Test Address 5",
      longitude: 1.0,
      latitude: 1.0,
    });
    const token = fastify.jwt.sign({ id: user.id });

    const form = new FormData();
    form.append("image", Buffer.from("Not an image"), {
      filename: "test.txt",
      contentType: "text/plain",
    });

    const response = await fastify.inject({
      method: "POST",
      url: `/v2/stores/${store.id}/photos`,
      headers: {
        authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
      payload: form,
    });

    t.equal(response.statusCode, 400);
    t.same(response.json(), { error: "photo.file.invalid_type" });
  });
});

tap.test("GET /v2/stores/:id/photos", async (t) => {
  t.test("should get all photos of a store", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser6",
      email: "photouser6@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 6",
      address: "Test Address 6",
      longitude: 1.0,
      latitude: 1.0,
    });

    await fastify.db.manager.save("Photo", {
      url: "/uploads/photo1.jpg",
      caption: "Photo 1",
      store: store.id,
      user: user.id,
    });

    await fastify.db.manager.save("Photo", {
      url: "/uploads/photo2.jpg",
      caption: "Photo 2",
      store: store.id,
      user: user.id,
    });

    const response = await fastify.inject({
      method: "GET",
      url: `/v2/stores/${store.id}/photos`,
    });

    t.equal(response.statusCode, 200);
    const photos = response.json();
    t.equal(photos.length, 2);
    // Photos are ordered by createdAt DESC
    t.ok(photos.find((p) => p.url === "/uploads/photo1.jpg"));
    t.ok(photos.find((p) => p.url === "/uploads/photo2.jpg"));
  });

  t.test("should return empty array if no photos", async (t) => {
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 7",
      address: "Test Address 7",
      longitude: 1.0,
      latitude: 1.0,
    });

    const response = await fastify.inject({
      method: "GET",
      url: `/v2/stores/${store.id}/photos`,
    });

    t.equal(response.statusCode, 200);
    t.same(response.json(), []);
  });

  t.test("should return 404 if store not found", async (t) => {
    const response = await fastify.inject({
      method: "GET",
      url: "/v2/stores/99999/photos",
    });

    t.equal(response.statusCode, 404);
    t.same(response.json(), { error: "store.notfound" });
  });
});

tap.test("DELETE /v2/stores/:id/photos/:photoId", async (t) => {
  t.test("should delete own photo", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser8",
      email: "photouser8@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 8",
      address: "Test Address 8",
      longitude: 1.0,
      latitude: 1.0,
    });

    const photo = await fastify.db.manager.save("Photo", {
      url: "/uploads/photo-to-delete.jpg",
      caption: "Photo to delete",
      store: store.id,
      user: user.id,
    });

    const token = fastify.jwt.sign({ id: user.id });

    const response = await fastify.inject({
      method: "DELETE",
      url: `/v2/stores/${store.id}/photos/${photo.id}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    t.equal(response.statusCode, 200);
    t.same(response.json(), { success: true });

    const deletedPhoto = await fastify.db.manager.findOne("Photo", {
      where: { id: photo.id },
    });
    t.equal(deletedPhoto, null);
  });

  t.test(
    "should return 403 if trying to delete someone else's photo",
    async (t) => {
      const user1 = await fastify.db.manager.save("User", {
        username: "photouser9",
        email: "photouser9@test.com",
        password: "test",
        role: 1,
        provider: "local",
      });
      const user2 = await fastify.db.manager.save("User", {
        username: "photouser10",
        email: "photouser10@test.com",
        password: "test",
        role: 1,
        provider: "local",
      });
      const store = await fastify.db.manager.save("Store", {
        name: "Test Store 9",
        address: "Test Address 9",
        longitude: 1.0,
        latitude: 1.0,
      });

      const photo = await fastify.db.manager.save("Photo", {
        url: "/uploads/photo-forbidden.jpg",
        store: store.id,
        user: user1.id,
      });

      const token = fastify.jwt.sign({ id: user2.id });

      const response = await fastify.inject({
        method: "DELETE",
        url: `/v2/stores/${store.id}/photos/${photo.id}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      t.equal(response.statusCode, 403);
      t.same(response.json(), { error: "photo.delete.forbidden" });
    }
  );

  t.test("should return 404 if photo not found", async (t) => {
    const user = await fastify.db.manager.save("User", {
      username: "photouser11",
      email: "photouser11@test.com",
      password: "test",
      role: 1,
      provider: "local",
    });
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 10",
      address: "Test Address 10",
      longitude: 1.0,
      latitude: 1.0,
    });
    const token = fastify.jwt.sign({ id: user.id });

    const response = await fastify.inject({
      method: "DELETE",
      url: `/v2/stores/${store.id}/photos/99999`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    t.equal(response.statusCode, 404);
    t.same(response.json(), { error: "photo.notfound" });
  });

  t.test("should return 401 if not authenticated", async (t) => {
    const store = await fastify.db.manager.save("Store", {
      name: "Test Store 11",
      address: "Test Address 11",
      longitude: 1.0,
      latitude: 1.0,
    });

    const response = await fastify.inject({
      method: "DELETE",
      url: `/v2/stores/${store.id}/photos/1`,
    });

    t.equal(response.statusCode, 401);
  });
});
