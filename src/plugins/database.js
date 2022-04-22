import fastifyPlugin from "fastify-plugin";
import { DataSource } from "typeorm";

import * as entities from "../entity/index.js";

async function db(fastify) {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = fastify.config;
  const AppDataSource = new DataSource({
    type: "mysql",
    host: DB_HOST,
    port: 3306,
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

export default fastifyPlugin(db);
