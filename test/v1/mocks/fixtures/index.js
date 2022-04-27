const { User } = require("./User.js");
const { Product } = require("./Product.js");
const { Store } = require("./Store.js");
const { Version } = require("./Version.js");
const { FeatureCategory, Feature } = require("./Feature.js");

module.exports = [User, Product, FeatureCategory, Feature, Store, Version];
