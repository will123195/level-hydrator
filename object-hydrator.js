var async = require('async');
var _ = require('lodash');
var propertyHydrator = require('./property-hydrator');

/**
 * Creates a ObjectHydrator instance that will hydrate/dehydrate all applicable properties.
 * @param  {Object} opts { name: { db: , uuid:  } }
 */
var ObjectHydrator = module.exports = function ObjectHydrator(opts) {

  if (!(this instanceof ObjectHydrator)) {
    return new ObjectHydrator(opts);
  }

  // initialize the propertyHydrators for each of the properties
  var h = this;
  this.hydrators = {};
  Object.keys(opts).forEach(function(name) {
    var db = opts[name].db;
    var uuidField = opts[name].uuid;
    h.hydrators[name] = propertyHydrator(db, uuidField);
  });

}


ObjectHydrator.prototype.hydrate = function(data, cb) {
  return this.process('hydrate', data, cb);
};


ObjectHydrator.prototype.dehydrate = function(data, cb) {
  return this.process('dehydrate', data, cb);
};


ObjectHydrator.prototype.process = function(action, data, cb) {
  if (action === 'dehydrate') {
    // clone so we don't dehydrate the source object being referenced
    data = _.cloneDeep(data);
  }
  if (Object.keys(this.hydrators).length === 0) {
    // no properties that are hydratable
    return cb(null, data);
  }
  // for each hydratable property
  var h = this;
  async.each(Object.keys(this.hydrators), function(name, done) {
    // use the preinitialized propertyHydrator to hydrate/dehydrate this property
    var value = data[name];
    if (!value) {
      return done();
    }
    h.hydrators[name][action](value, function(err, value) {
      if (err) return done(err);
      data[name] = value;
      done();
    });
  }, function(err) {
    if (err) return cb(err);
    cb(null, data);
  });
};

