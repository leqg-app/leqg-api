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
  const { id, name, address, longitude, latitude, features } = store;
  const products = store.products.reduce(
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

  const schedules = new Array(7).fill().map(() => []);
  for (const schedule of store.schedules) {
    const {
      dayOfWeek,
      closed,
      opening = null,
      closing = null,
      openingSpecial = null,
      closingSpecial = null,
    } = schedule;

    if (closed) {
      schedules[dayOfWeek - 1] = 0;
      continue;
    }

    if (opening === null && openingSpecial === null) {
      continue;
    }

    if (opening !== null && closing !== null) {
      schedules[dayOfWeek - 1][0] = [opening, closing];
    }

    if (openingSpecial !== null && closingSpecial !== null) {
      if (!schedules[dayOfWeek - 1][0]) {
        schedules[dayOfWeek - 1][0] = [];
      }
      schedules[dayOfWeek - 1][1] = [openingSpecial, closingSpecial];
    }
  }

  return [
    id,
    name,
    address,
    +longitude.toFixed(5),
    +latitude.toFixed(5),
    getLowest(store.products.map((p) => p.price).filter(Boolean)),
    getLowest(store.products.map((p) => p.specialPrice).filter(Boolean)),
    store.products?.[0]?.currencyCode || "EUR",
    products,
    schedules,
    features.map(({ id }) => id),
  ];
}

module.exports = { formatStores };
