var async = require('async');
var _ = require('lodash');
var UUID = require('uuid');

var SimpleHydrator = module.exports = function SimpleHydrator(db, uuidField) {

  if (!(this instanceof SimpleHydrator)) {
    return new SimpleHydrator(db, uuidField);
  }

  this.db = db;
  this.uuidField = uuidField;

}


SimpleHydrator.prototype.hydrate = function(uuid, cb) {
  if (_.isObject(uuid)) {
    // the value is an object, we can assume it's alaready a hydrated value
    var value = uuid;
    return cb(null, value);
  }
  this.db.get(uuid, function(err, value) {
    if (err) return cb(err);
    return cb(null, value);
  });
};


SimpleHydrator.prototype.dehydrate = function(value, cb) {
  if (_.isString(value)) {
    // the value is a string, we can assume it's a valid uuid
    // TODO check if this uuid actually exists in the db
    return cb(null, value);
  }
  // we can assume the value is a data object
  // check to see if this object has its uuid property
  var key = value[this.uuidField];
  if (key) {
    // this object has a uuid value set
    return cb(null, key);

    // check if the uuid in the value is valid
    this.db.get(key, function(err, record) {
      if (err) return cb(err);
      // the uuid is valid
      return cb(null, key);
    });
  } else {
    // this object does not have a uuid property
    // insert a new record
    // TODO add a hook so we can handle this with a custom method
    var uuid = UUID.v4();

    // add the uuid property of this object before saving the object
    // make the uuid the first property of the object
    var newValue = {};
    newValue[this.uuidField] = uuid;
    newValue = _.merge(newValue, value);

    this.save(uuid, newValue, function(err, uuid) {
      cb(err, uuid);
    });
  }
};


SimpleHydrator.prototype.save = function(uuid, value, cb) {
  this.db.put(uuid, value, function(err) {
    if (err) return cb(err);
    return cb(null, uuid);
  });
};


