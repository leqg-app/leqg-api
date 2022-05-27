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

function addSchedule(acc, key, value) {
  if (acc[key]) {
    acc[key].push(value);
  } else {
    acc[key] = [value];
  }
}

function getSchedules(schedules) {
  return Object.keys(schedules).map((key) => [
    schedules[key],
    key !== "0" ? key.split("-").map((i) => +i) : 0,
  ]);
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

  const schedules = {};
  const specialSchedules = {};

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
      addSchedule(schedules, "0", dayOfWeek);
      continue;
    }

    if (opening !== null && closing !== null) {
      addSchedule(schedules, `${opening}-${closing}`, dayOfWeek);
    }

    if (openingSpecial !== null && closingSpecial !== null) {
      addSchedule(
        specialSchedules,
        `${openingSpecial}-${closingSpecial}`,
        dayOfWeek
      );
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
    getSchedules(schedules),
    getSchedules(specialSchedules),
    features.map(({ id }) => id),
  ];
}

module.exports = { formatStores };
