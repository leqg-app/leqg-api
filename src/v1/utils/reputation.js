const { STORE } = require("../../reputations.js");

/**
 * - if this field was edited: take the last change and check the user
 * - if this was never edited: check if the user has created the entity
 */
function isAlreadyEdited(field, delta, revisions, userId) {
  const sorted = Array.from(revisions).sort((a, b) => (a.id < b.id ? 1 : -1));
  for (const revision of sorted) {
    for (const change of revision.changes) {
      if (
        (change.field === field &&
          (!delta.id || delta.id === change.delta.id)) ||
        change.type === "initial"
      ) {
        return revision.user.id === userId;
      }
    }
  }
}

function addReputation({ total, fields }, field, reputation) {
  if (!reputation) {
    return { total, fields };
  }
  return {
    total: total + reputation,
    fields: fields.concat({
      reputation,
      field,
    }),
  };
}

function calculateReputation(revisions, changes, userId) {
  return changes.reduce(
    (previous, { field, type, delta }) => {
      if (STORE.PREDICATES[field] && !STORE.PREDICATES[field](delta)) {
        return previous;
      }
      if (type === "created") {
        return addReputation(previous, field, STORE.CREATION[field]);
      }
      if (type === "updated") {
        const alreadyEdited = isAlreadyEdited(field, delta, revisions, userId);
        if (alreadyEdited) {
          return addReputation(previous, field, 0);
        }
        return addReputation(previous, field, STORE.EDITION[field]);
      }
      return previous;
    },
    { total: 0, fields: [] }
  );
}

module.exports = {
  calculateReputation,
};
