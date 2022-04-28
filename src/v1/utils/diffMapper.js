function diffMapper(left, right, toMap = []) {
  const returns = [];
  for (const field in left) {
    if (toMap.length && !toMap.includes(field)) {
      continue;
    }

    const before = left[field];
    const after = right[field];

    if (after === before || (!after && !before)) {
      continue;
    }

    if (after === undefined) {
      // Deleted field
      returns.push({
        field,
        type: "deleted",
        delta: before,
      });
      continue;
    }

    if (!Array.isArray(before) && after !== before) {
      // Updated field
      returns.push({
        field,
        type: "updated",
        delta: before,
      });
      continue;
    }

    if (!Array.isArray(after)) {
      continue;
    }

    for (const item of before) {
      if (!item.id) {
        continue;
      }

      const same = after.find(({ id }) => id === item.id);
      if (same) {
        if (diffMapper(same, item).length) {
          // Updated item
          returns.push({
            field,
            type: "updated",
            delta: item,
          });
        }
        continue;
      }

      // Deleted item
      returns.push({
        field,
        type: "deleted",
        delta: item,
      });
    }

    for (const item of after) {
      if (!item.id) {
        // Created item
        returns.push({
          field,
          type: "created",
          delta: item,
        });
        continue;
      }

      const same = before.find(({ id }) => id === item.id);
      if (!same) {
        // Created item
        returns.push({
          field,
          type: "created",
          delta: item,
        });
        continue;
      }
    }
  }

  for (const field in right) {
    if (toMap.length && !toMap.includes(field)) {
      continue;
    }

    const before = left[field];
    const after = right[field];

    if (before === undefined) {
      // Created field
      returns.push({
        field,
        type: "created",
        delta: after,
      });
    }
  }
  return returns;
}

module.exports = diffMapper;
