const fastifyPlugin = require("fastify-plugin");
const { DataSource } = require("typeorm");

const entities = require("../entity/index.js");

async function db(fastify) {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = fastify.config;
  const AppDataSource = new DataSource({
    type: "mysql",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    synchronize: true,
    entities,
  });

  await AppDataSource.initialize();

  fastify.decorate("db", AppDataSource);
  fastify.addHook("onClose", (fastifyInstance, done) => {
    AppDataSource.destroy().then(done).catch(done);
  });
}

module.exports = fastifyPlugin(db);
