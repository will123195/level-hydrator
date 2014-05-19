var objectHydrator = require('./object-hydrator');

var Hydrator = module.exports = function Hydrator(opts) {

  if (!(this instanceof Hydrator)) {
    return new Hydrator(opts);
  }

  // TODO: validate the opts

  // instantiate an objectHydrator for each type of object specified
  var that = this;
  Object.keys(opts.types).forEach(function(name) {

    that[name] = objectHydrator(opts.types[name]);

  });

};
