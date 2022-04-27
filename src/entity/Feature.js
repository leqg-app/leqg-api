const { EntitySchema } = require("typeorm");

const Feature = new EntitySchema({
  name: "Feature",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      unique: true,
    },
  },
  relations: {
    featureCategory: {
      type: "many-to-one",
      target: "FeatureCategory",
      inverseSide: "features",
    },
  },
});

module.exports = {
  Feature,
};
