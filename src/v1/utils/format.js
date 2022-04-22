function getLowest(numbers) {
  if (!numbers.length) {
    return null;
  }
  if (numbers.length === 1) {
    return numbers[0];
  }
  return numbers.reduce((lowest, number) =>
    lowest < number ? lowest : number
  );
}

export function formatStore(store) {
  const { id, name, longitude, latitude, products, schedules, features } =
    store;
  const productsIds = products.reduce((products, { productId }) => {
    if (productId && !products.includes(productId)) {
      products.push(productId);
    }
    return products;
  }, []);
  const specialPrice = getLowest(
    products.map((p) => p.specialPrice).filter(Boolean)
  );
  return {
    id,
    name,
    lng: longitude,
    lat: latitude,
    price: getLowest(products.map((p) => p.price).filter(Boolean)),
    currency: products[0] && products[0].currencyCode,
    ...(specialPrice && { specialPrice }),
    ...(productsIds.length && { products: productsIds }),
    s: schedules.reduce((schedules, schedule) => {
      schedules[schedule.dayOfWeek - 1] = {
        cd: schedule.closed,
        ...(schedule.opening &&
          schedule.closing && {
            o: schedule.opening,
            c: schedule.closing,
          }),
        ...(schedule.openingSpecial &&
          schedule.closingSpecial && {
            os: schedule.openingSpecial,
            cs: schedule.closingSpecial,
          }),
      };
      return schedules;
    }, new Array(7)),
    ...(features.length && { f: features.map(({ id }) => id) }),
  };
}
