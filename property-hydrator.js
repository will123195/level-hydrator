var async = require('async');
var _ = require('lodash');
var simpleHydrator = require('./simple-hydrator');

/**
 * PropertyHydrator accounts for a property having a simple value or an array of values.
 */
var PropertyHydrator = module.exports = function PropertyHydrator(db, uuidField) {

  if (!(this instanceof PropertyHydrator)) {
    return new PropertyHydrator(db, uuidField);
  }

  this.simple = simpleHydrator(db, uuidField);

}

// value is uuid or array of uuids
PropertyHydrator.prototype.hydrate = function(value, cb) {
  var h = this;
  if (_.isArray(value)) {
    var hydrated = [];
    var values = value;
    async.eachSeries(values, function(value, next) {
      h.simple.hydrate(value, function(err, obj) {
        hydrated.push(obj);
        next(err);
      });
    }, function(err) {
      return cb(err, hydrated);
    });
  } else {
    return this.simple.hydrate(value, cb);
  }
};

// value is an object or array of objects
PropertyHydrator.prototype.dehydrate = function(value, cb) {
  var h = this;
  value = _.cloneDeep(value);
  if (_.isArray(value)) {
    var dehydrated = [];
    var values = value;
    async.eachSeries(values, function(value, next) {
      h.simple.dehydrate(value, function(err, uuid) {
        dehydrated.push(uuid);
        next(err);
      });
    }, function(err) {
      return cb(err, dehydrated);
    });
  } else {
    return this.simple.dehydrate(value, cb);
  }
}

