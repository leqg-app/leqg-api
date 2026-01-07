const S = require("fluent-json-schema");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { pipeline } = require("stream");
const crypto = require("crypto");
const { Photo, Product } = require("../../entity/index.js");
const { Store } = require("../../entity/Store.js");
const { isRole, ROLES } = require("../../plugins/authentication.js");
const REPUTATIONS = require("../../reputations.js");

const pump = promisify(pipeline);

const addPhoto = {
  schema: {
    summary: "Add a photo to a store",
    tags: ["store", "photo"],
    params: S.object().prop("id", S.integer().required()),
    consumes: ["multipart/form-data"],
    response: {
      200: S.object()
        .prop("photo", S.ref("photoSchema"))
        .prop("reputation", S.ref("reputationSchema")),
      404: S.ref("errorSchema"),
      400: S.ref("errorSchema"),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { id } = req.params;

    const store = await req.server.db.manager.findOne(Store, {
      where: { id },
    });

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    // Get multipart data
    let data;
    try {
      data = await req.file();
    } catch (error) {
      return reply.status(400).send({ error: "photo.file.required" });
    }

    if (!data) {
      return reply.status(400).send({ error: "photo.file.required" });
    }

    // Check if it's an image
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: "photo.file.invalid_type" });
    }

    // Generate unique filename
    const ext = path.extname(data.filename);
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${Date.now()}-${hash}${ext}`;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), req.server.config.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const filepath = path.join(uploadDir, filename);
    await pump(data.file, fs.createWriteStream(filepath));

    // Get caption and productId from fields
    const caption = data.fields.caption?.value || null;
    const productId = data.fields.productId?.value
      ? parseInt(data.fields.productId.value, 10)
      : null;

    // If productId is provided, verify the product exists
    if (productId) {
      const product = await req.server.db.manager.findOne(Product, {
        where: { id: productId },
      });

      if (!product) {
        return reply.status(404).send({ error: "product.notfound" });
      }
    }

    // Generate URL
    const url = `/uploads/${filename}`;

    const photo = await req.server.db.manager.save(Photo, {
      url,
      caption,
      store: id,
      user: req.user.id,
      product: productId,
    });

    const reputation = REPUTATIONS.STORE.PHOTO;

    // Save contribution
    await req.server.db.manager.save("Contribution", {
      user: req.user.id,
      reputation,
      reason: "store.photo.creation",
    });

    // Load photo with relations
    const photoWithRelations = await req.server.db.manager.findOne(Photo, {
      where: { id: photo.id },
      relations: { user: true, product: true },
    });

    return {
      photo: photoWithRelations,
      reputation: {
        total: reputation,
        reason: "store.photo.creation",
      },
    };
  },
};

const getStorePhotos = {
  schema: {
    summary: "Get all photos of a store",
    tags: ["store", "photo"],
    params: S.object().prop("id", S.integer().required()),
    response: {
      200: S.array().items(S.ref("photoSchema")),
      404: S.ref("errorSchema"),
    },
  },
  handler: async (req, reply) => {
    const { id } = req.params;

    const store = await req.server.db.manager.findOne(Store, {
      where: { id },
    });

    if (!store) {
      return reply.status(404).send({ error: "store.notfound" });
    }

    const photos = await req.server.db.manager.find(Photo, {
      where: { store: { id } },
      relations: { user: true, product: true },
      order: { createdAt: "DESC" },
    });

    return photos;
  },
};

const deletePhoto = {
  schema: {
    summary: "Delete a photo",
    tags: ["store", "photo"],
    params: S.object()
      .prop("id", S.integer().required())
      .prop("photoId", S.integer().required()),
    response: {
      200: S.object().prop("success", S.boolean()),
      403: S.ref("errorSchema"),
      404: S.ref("errorSchema"),
    },
  },
  onRequest: [isRole(ROLES.USER)],
  handler: async (req, reply) => {
    const { id, photoId } = req.params;

    const photo = await req.server.db.manager.findOne(Photo, {
      where: { id: photoId, store: { id } },
      relations: { user: true },
    });

    if (!photo) {
      return reply.status(404).send({ error: "photo.notfound" });
    }

    // Only the photo owner or an admin can delete it
    if (photo.user.id !== req.user.id && req.user.role !== ROLES.ADMIN) {
      return reply.status(403).send({ error: "photo.delete.forbidden" });
    }

    await req.server.db.manager.delete(Photo, photoId);

    return { success: true };
  },
};

module.exports = {
  addPhoto,
  getStorePhotos,
  deletePhoto,
};
