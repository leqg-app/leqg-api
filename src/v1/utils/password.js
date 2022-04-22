import bcrypt from "bcryptjs";

export const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return reject(err);
      }
      resolve(hash);
    });
  });

export const comparePassword = (clear, hashed) => bcrypt.compare(clear, hashed);
