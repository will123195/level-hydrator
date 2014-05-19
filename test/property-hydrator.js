var should = require('should');
var level = require('level');
var path = require('path');
var propertyHydrator = require('../property-hydrator');
var rimraf = require('rimraf');

describe('property-hydrator', function() {

  var db;
  var dbPath = path.join(__dirname, '..', 'data', 'test-db');
  var uuidField = 'uuid';

  beforeEach(function(done) {
    rimraf.sync(dbPath);
    db = level(dbPath, { valueEncoding: 'json' }, done);
  });

  afterEach(function(done) {
    db.close(done);
  });


  it('should dehydrate and hydrate a value', function(done) {
    var sh = propertyHydrator(db, uuidField);
    var value = {
      test: {
        a: 1,
        b: 2
      }
    };
    sh.dehydrate(value, function(err, dehydrated) {
      //console.log('dehydrated: ', dehydrated);
      sh.hydrate(dehydrated, function(err, hydrated) {
        //console.log('hydrated: ', hydrated);
        value.test.should.eql(hydrated.test);
        hydrated.should.have.property(uuidField);
        done();
      });
    });
  });


  it('should dehydrate and hydrate an array of values', function(done) {
    var sh = propertyHydrator(db, uuidField);
    var values = [
      {test: { a: 1, b: 2 } },
      {test: { c: 3, d: 4 } }
    ];
    sh.dehydrate(values, function(err, dehydrated) {
      //console.log('dehydrated: ', dehydrated);
      sh.hydrate(dehydrated, function(err, hydrated) {
        //console.log('hydrated: ', hydrated);
        values[1].test.should.eql(hydrated[1].test);
        hydrated[1].should.have.property(uuidField);
        done();
      });
    });
  });



});