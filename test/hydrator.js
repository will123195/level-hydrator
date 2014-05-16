var should = require('should');
var level = require('level');
var sub = require('level-sublevel');
var path = require('path');
var hydrator = require('..');
var rimraf = require('rimraf');

describe('sublevel-hydrator', function() {
  var db, dbPath = path.join(__dirname, '..', 'data', 'test-db');

  db = sub(level(dbPath, { valueEncoding: 'json' }));

  // beforeEach(function(done) {
  //   rimraf.sync(dbPath);
  //   db = sub(level(dbPath, { valueEncoding: 'json' }, done));
  // });

  // afterEach(function(done) {
  //   db.close(done);
  // });



  it('should dehydrate and hydrate an object', function(done) {

    var Author = db.sublevel('author');
    var Book = db.sublevel('book');

    var h = hydrator({
      dbs: {
        author: {
          db: Author,
          uuid: 'authorId',
          properties: {
            books: Book,
          }
        },
        book: {
          db: Book,
          uuid: 'bookId'
        }
      }
    });

    var author = {
      name: 'Jack Kerouac',
      books: [
        {
          title: 'On the Road',
          year: 1957
        }
      ]
    };

    h.author.dehydrate(author, function(err, author) {

      console.log('author1:', author);

      var newUUID = author.books[0];
      newUUID.should.be.a.String;

      h.author.hydrate(author, function(err, author) {

        console.log('author2:', author);

        author.books[0].bookId.should.equal(newUUID);

      });

    });

    done();
  });



});