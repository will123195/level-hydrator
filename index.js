var objectHydrator = require('./object-hydrator');

var Hydrator = module.exports = function Hydrator(types, opts) {

  if (!(this instanceof Hydrator)) {
    return new Hydrator(types);
  }

  // TODO: validate the opts

  // instantiate an objectHydrator for each type of object specified
  var that = this;
  Object.keys(types).forEach(function(name) {

    that[name] = objectHydrator(types[name]);

  });

};
