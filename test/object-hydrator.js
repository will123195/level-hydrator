var should = require('should');
var level = require('level');
var path = require('path');
var objectHydrator = require('../object-hydrator');
var rimraf = require('rimraf');
var sub = require('level-sublevel');

describe('object-hydrator', function() {

  var db, Author, Book;
  var dbPath = path.join(__dirname, '..', 'data', 'test-db');
  var uuidField = 'uuid';

  beforeEach(function(done) {
    //rimraf.sync(dbPath);
    db = sub(level(dbPath, { valueEncoding: 'json' }, done));
    Author = db.sublevel('author');
    Book = db.sublevel('book');
  });

  afterEach(function(done) {
    db.close(done);
  });


  it('should dehydrate and hydrate an object', function(done) {
    var userOpts = {
      favoriteAuthor: {
        db: Author,
        uuidField: 'authorId'
      },
      favoriteBooks: {
        db: Book,
        uuidField: 'bookId'
      }
    };
    var h = objectHydrator(userOpts);
    var user = {
      username: 'will123195',
      favoriteAuthor: {
        name: 'Jack Kerouac'
      },
      favoriteBooks: [
        {
          title: 'On the Road',
          year: 1957
        }
      ]
    };
    h.dehydrate(user, function(err, dehydrated) {
      //console.log('dehydrated: ', dehydrated);
      h.hydrate(dehydrated, function(err, hydrated) {
        //console.log('hydrated: ', hydrated);
        user.username.should.eql(hydrated.username);
        user.favoriteAuthor.name.should.eql(hydrated.favoriteAuthor.name);
        hydrated.favoriteAuthor.should.have.property('authorId');
        user.favoriteBooks[0].year.should.eql(1957);
        done();
      });
    });
  });


});