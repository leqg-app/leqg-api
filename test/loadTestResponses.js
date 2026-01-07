const fs = require("fs");
const tap = require("tap");

const dynamicFields = [
  "jwt",
  "created_at",
  "updated_at",
  "createdAt",
  "updatedAt",
];

function filterKeys(key, value) {
  if (dynamicFields.includes(key)) {
    return null;
  }
  return value;
}

function loadTestResponses(responsePath) {
  if (!responsePath) {
    throw `loadTestResponses need responses path in arg`;
  }
  if (!fs.existsSync(responsePath)) {
    fs.writeFileSync(responsePath, "{}");
  }
  const responses = require(responsePath);
  return function (response, testName) {
    if (!testName) {
      return;
    }
    response = JSON.parse(JSON.stringify(response, filterKeys));
    const reference = responses[testName];
    if (!reference) {
      responses[testName] = response;
      fs.writeFileSync(responsePath, JSON.stringify(responses, filterKeys, 2));
      return true;
    }
    return tap.same(responses[testName], response);
  };
}

module.exports = loadTestResponses;
