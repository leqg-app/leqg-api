const entities = require("../../../src/entity/index.js");

module.exports.FeatureCategory = {
  repository: entities.FeatureCategory,
  data: [
    {
      id: 1,
      name: "Ambiances",
    },
    {
      id: 2,
      name: "Lieux",
    },
  ],
};

module.exports.Feature = {
  repository: entities.Feature,
  data: [
    {
      name: "Etudiant",
      featureCategory: 1,
    },
    {
      name: "Evenements sportifs",
      featureCategory: 1,
    },
    {
      name: "Rooftop",
      featureCategory: 2,
    },
    {
      name: "Terrasse",
      featureCategory: 2,
    },
  ],
};
