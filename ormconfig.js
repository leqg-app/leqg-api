const { DataSource } = require("typeorm");
const entities = require("./src/entity/index.js");
const dotenv = require("dotenv");
dotenv.config();

module.exports = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  synchronize: false,
  entities,
  migrations: ["src/migrations/*.js"],
  migrationsTableName: "migrations",
});
