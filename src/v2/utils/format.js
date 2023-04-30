function getLowest(numbers) {
  if (!numbers.length) {
    return 0;
  }
  if (numbers.length === 1) {
    return numbers[0];
  }
  return numbers.reduce((lowest, number) =>
    lowest < number ? lowest : number
  );
}

function formatStores(store) {
  const {
    id,
    name,
    address,
    longitude,
    latitude,
    schedules = [],
    products = [],
    features = [],
    rate,
  } = store;

  const productsMinified = store.products.reduce(
    (products, product) =>
      products.concat([
        [
          product.productId || 0,
          product.price || 0,
          product.specialPrice || 0,
          product.volume,
        ],
      ]),
    []
  );

  const schedulesMinified = new Array(7).fill().map(() => []);
  for (const schedule of schedules) {
    const {
      dayOfWeek,
      closed,
      opening = null,
      closing = null,
      openingSpecial = null,
      closingSpecial = null,
    } = schedule;

    if (closed) {
      schedulesMinified[dayOfWeek - 1] = 0;
      continue;
    }

    if (opening === null && openingSpecial === null) {
      continue;
    }

    if (opening !== null && closing !== null) {
      schedulesMinified[dayOfWeek - 1][0] = [opening, closing];
    }

    if (openingSpecial !== null && closingSpecial !== null) {
      if (!schedulesMinified[dayOfWeek - 1][0]) {
        schedulesMinified[dayOfWeek - 1][0] = [];
      }
      schedulesMinified[dayOfWeek - 1][1] = [openingSpecial, closingSpecial];
    }
  }

  return [
    id,
    name,
    address,
    +parseFloat(longitude).toFixed(5),
    +parseFloat(latitude).toFixed(5),
    getLowest(products.map((p) => p.price).filter(Boolean)),
    getLowest(products.map((p) => p.specialPrice).filter(Boolean)),
    products?.[0]?.currencyCode || "EUR",
    productsMinified,
    schedulesMinified,
    features.map(({ id }) => id),
    rate ? parseFloat(rate) : 0,
  ];
}

module.exports = { formatStores };
