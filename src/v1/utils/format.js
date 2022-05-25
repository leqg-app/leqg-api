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

function formatStores(store) {
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
    }, new Array(7).fill({ cd: false })),
    f: features.map(({ id }) => id),
  };
}

function formatStore(store) {
  if (store.schedules.length < 7) {
    store.schedules = new Array(7)
      .fill()
      .map((_, i) => ({ dayOfWeek: i + 1, closed: false }));
  }
  if (store.features) {
    store.features = store.features.map(({ id }) => id);
  }
  if (store.products) {
    store.products.map((p) => {
      p.product = p.productId;
      delete p.productId;
    });
  }
  if (store.revisions) {
    store.revisions.map((revision) => {
      revision.author = { username: revision.user.username };
      revision.created_at = revision.createdAt.getTime();
    });
  }
  return store;
}

module.exports = { formatStores, formatStore };
