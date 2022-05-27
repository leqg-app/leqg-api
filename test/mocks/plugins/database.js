const fastifyPlugin = require("fastify-plugin");
const { DataSource } = require("typeorm");

const entities = require("../../../src/entity/index.js");
const fixtures = require("../fixtures/index.js");

async function db(fastify) {
  const AppDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    synchronize: true,
    entities,
  });

  const connection = await AppDataSource.initialize();

  for (const fixture of fixtures) {
    const repo = connection.getRepository(fixture.repository);
    for (const data of fixture.data) {
      await repo.save(data);
    }
  }

  fastify.decorate("db", AppDataSource);
  fastify.addHook("onClose", (fastifyInstance, done) => {
    AppDataSource.destroy().then(done).catch(done);
  });
}

module.exports = fastifyPlugin(db);
