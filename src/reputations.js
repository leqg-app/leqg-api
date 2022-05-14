const STORE = {
  PREDICATES: {
    schedules: ({ open, close, closed }) =>
      (open !== undefined && close !== undefined) || closed,
  },
  CREATION: {
    name: 5,
    address: 5,
    website: 5,
    phone: 3,
    products: 5,
    schedules: 2,
    feature: 2,
  },
  EDITION: {
    name: 2,
    address: 2,
    products: 5,
    schedules: 2,
    feature: 2,
  },
  VALIDATION: 2,
};

module.exports = {
  STORE,
};
