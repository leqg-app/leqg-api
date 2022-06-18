const { EntitySchema } = require("typeorm");

const Schedule = new EntitySchema({
  name: "Schedule",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    dayOfWeek: {
      type: "int",
    },
    opening: {
      type: "int",
      nullable: true,
    },
    closing: {
      type: "int",
      nullable: true,
    },
    openingSpecial: {
      type: "int",
      nullable: true,
    },
    closingSpecial: {
      type: "int",
      nullable: true,
    },
    closed: {
      type: "boolean",
    },
  },
  relations: {
    store: {
      type: "many-to-one",
      target: "Store",
      inverseSide: "schedules",
      onDelete: "CASCADE",
    },
  },
});

module.exports = {
  Schedule,
};
