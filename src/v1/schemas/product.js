import fastifyPlugin from "fastify-plugin";
import S from "fluent-json-schema";

const productSchema = fastifyPlugin(async function (fastify) {
  const productBaseSchema = S.object()
    .additionalProperties(false)
    .id("productBaseSchema")
    .prop("name", S.string())
    .prop("type", S.string())
    .prop("custom", S.anyOf([S.null(), S.object().prop("color", S.string())]));

  const productSchema = S.object()
    .additionalProperties(false)
    .id("productSchema")
    .prop("id", S.integer())
    .extend(productBaseSchema);

  fastify.addSchema(productBaseSchema);
  fastify.addSchema(productSchema);
});

export { productSchema };
