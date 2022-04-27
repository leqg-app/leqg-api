const bcrypt = require("bcryptjs");

const hashPassword = (password) =>
  new Promise((resolve) =>
    bcrypt.hash(password, 10, (_, hash) => resolve(hash))
  );

const comparePassword = (clear, hashed) => bcrypt.compare(clear, hashed);

module.exports = {
  hashPassword,
  comparePassword,
};
