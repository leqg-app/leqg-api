const entities = require("../../../../src/entity/index.js");

module.exports.User = {
  repository: entities.User,
  data: [
    {
      username: "admin",
      email: "admin@leqg.app",
      password: "$2a$10$jEhmv8RS5kIN9LOX9Pl01u.jDiZJwWLDztNJ5nWz/Avyhk7DVIVEa",
      blocked: false,
      confirmed: true,
      role: 3,
      provider: "local",
    },
    {
      username: "blocked",
      email: "blocked@leqg.app",
      password: "$2a$10$jEhmv8RS5kIN9LOX9Pl01u.jDiZJwWLDztNJ5nWz/Avyhk7DVIVEa",
      blocked: true,
      confirmed: true,
      role: 1,
      provider: "local",
    },
    {
      username: "google",
      email: "google@leqg.app",
      password: "",
      blocked: false,
      confirmed: true,
      role: 1,
      provider: "google",
    },
  ],
};
