import { EntitySchema } from "typeorm";

export const FeatureCategory = new EntitySchema({
  name: "FeatureCategory",
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
    features: {
      type: "one-to-many",
      target: "Feature",
      inverseSide: "featureCategory",
      eager: true,
    },
  },
});
