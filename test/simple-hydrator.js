var should = require('should');
var level = require('level');
var path = require('path');
var simpleHydrator = require('../simple-hydrator');
var rimraf = require('rimraf');

describe('simple-hydrator', function() {

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
    var sh = simpleHydrator(db, uuidField);
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



});