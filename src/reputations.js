const STORE = {
  PREDICATES: {
    schedules: ({ open, close, closed }) => (open && close) || closed,
  },
  CREATION: {
    name: 5,
    address: 5,
    website: 5,
    phone: 5,
    products: 5,
    schedules: 2,
    features: 2,
  },
  EDITION: {
    name: 2,
    address: 2,
    website: 2,
    phone: 2,
    products: 5,
    schedules: 2,
    features: 2,
  },
  VALIDATION: 5,
  RATE: 10,
  COMMENT: 10,
  LONG_COMMENT: 10,
  RECOMMENDED_PRODUCT: 5,
};

module.exports = {
  STORE,
};
