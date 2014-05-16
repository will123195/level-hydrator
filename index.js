var _ = require('lodash');
var async = require('async');
var UUID = require('uuid');

var Hydrator = module.exports = function Hydrator(opts) {

  if (!(this instanceof Hydrator)) {
    return new Hydrator(opts);
  }

  var H = this;
  this.opts = opts;

  // TODO: validate the opts

  // create the hydrate() and dehydrate() methods for each
  Object.keys(opts.dbs).forEach(function(alias) {
    if (alias === 'opts') {
      throw new Error('"opts" is not a valid db alias.');
    }

    H[alias] = {

      /**
       * [hydrate description]
       * @param  {[type]}   data [description]
       * @param  {Function} cb   [description]
       * @return {[type]}        [description]
       */
      hydrate: function(data, cb) {
        var that = this;
        var properties = H.opts.dbs[alias].properties;
        if (properties) {
          async.eachSeries(Object.keys(properties), function(property, done) {

            H.hydrateValue(alias, data[property], properties[property], function(err, foreignObj) {
              if (err) return done(err);
              data[property] = foreignObj;
              done();
            });

          }, function(err) {
            if (err) return cb(err);
            cb(null, data);
          });
        } else {
          // this object doesn't need to be dehydrated, return as-is
          cb(null, data);
        }
      },

      /**
       * [dehydrate description]
       * @param  {[type]}   data [description]
       * @param  {Function} cb   [description]
       * @return {[type]}        [description]
       */
      dehydrate: function(data, cb) {
        // clone so we don't dehydrate the source object being referenced
        var data = _.cloneDeep(data);
        var that = this;
        var properties = H.opts.dbs[alias].properties;
        if (properties) {
          async.eachSeries(Object.keys(properties), function(property, done) {

            H.dehydrateValue(alias, data[property], properties[property], function(err, uuid) {
              if (err) return done(err);
              data[property] = uuid;
              done();
            });

          }, function(err) {
            if (err) return cb(err);
            cb(null, data);
          });
        } else {
          // this object doesn't need to be dehydrated, return as-is
          cb(null, data);
        }
      }
    };

  });

};


Hydrator.prototype.hydrateValue = function(alias, value, db, cb) {
  var opts = {};
  if (_.isArray(value)) {
    var arr = [];
    var values = value;
    async.eachSeries(values, function(value, callback) {
      hydrate(value, function(err, obj) {
        arr.push(obj);
        callback(err);
      });
    }, function(err) {
      return cb(err, arr);
    });
  } else if (_.isString(value)) {
    return hydrate(value, cb);
  } else {
    return cb(null, value);
  }

  function hydrate(uuid, cb) {
    db.get(uuid, function(err, obj) {
      if (err) return cb(err);
      return cb(null, obj);
    });
  }
};


/**
 * Converts a value into a foreign key.
 *
 * Possible input values are:
 * - (string) a valid foreign key (will be returned as is)
 * - (object) a value with a valid foreign key property
 * - (object) a value without a valid foreign key (adds new foreign key)
 * - (array) an array of any of the above
 *
 * @param  {mixed}    value see above
 * @param  {object}   db    the foreign leveldb (or sublevel)
 * @param  {Function} cb(err, uuid)
 */
Hydrator.prototype.dehydrateValue = function(alias, value, db, cb) {
  var H = this;

  value = _.cloneDeep(value);
  if (!_.isArray(value)) {
    return dehydrate(value, cb);
  }
  var dehydrated = [];
  var values = value;
  async.eachSeries(values, function(value, callback) {
    dehydrate(value, function(err, uuid) {
      dehydrated.push(uuid);
      callback(err);
    });
  }, function(err) {
    return cb(err, dehydrated);
  });

  function dehydrate(value, cb) {
    if (_.isString(value)) {
      // the value is a string, we can assume it's a valid uuid
      // TODO check if this uuid actually exists in the db
      return cb(null, value);
    }
    // we can assume the value is a data object
    // check to see if this object has its uuid property
    var uuidField = H.opts.dbs[alias].uuid;
    var foreignKey = value[uuidField];
    if (foreignKey) {
      // this object has a uuid
      return cb(null, foreignKey);
      // check if the uuid in the value is valid
      db.get(foreignKey, function(err, record) {
        if (err) return cb(err);
        // the uuid is valid
        return cb(null, foreignKey);
      });
    } else {
      // this object does not have a uuid property
      // insert a new foreign record
      // TODO add a hook so we can handle this with a custom method
      putNewRecord(value, cb);
    }
  }

  function putNewRecord(value, cb) {
    // add new foreign object record
    var uuid = UUID.v4();
    // TODO: don't rely on sublevel
    var foreignAlias = db._prefix;
    value[H.opts.dbs[foreignAlias].uuid] = uuid;
    db.put(uuid, value, function(err) {
      if (err) return cb(err);
      return cb(null, uuid);
    });
  }

};