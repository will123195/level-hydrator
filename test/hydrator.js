var should = require('should');
var level = require('level');
var sub = require('level-sublevel');
var path = require('path');
var hydrator = require('..');
var rimraf = require('rimraf');

describe('level-hydrator', function() {

  var db1, db2;
  var dbPath = path.join(__dirname, '..', 'data', 'test-db');
  var uuidField = 'uuid';

  beforeEach(function(done) {
    //rimraf.sync(dbPath);
    var dbPath = [
      path.join(__dirname, '..', 'data', 'test-db1'),
      path.join(__dirname, '..', 'data', 'test-db2')
    ];

    db1 = sub(level(dbPath[0], { valueEncoding: 'json' }));
    db2 = level(dbPath[1], { valueEncoding: 'json' }, done);
  });

  afterEach(function(done) {
    db1.close();
    db2.close(done);
  });


  it('should dehydrate and hydrate an object using sublevels', function(done) {

    var Book = db1.sublevel('book');

    var h = hydrator({
      types: {
        author: {
          books: {
            db: Book,
            uuidField: 'bookId'
          }
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
      //console.log('author dehydrated:', author);
      var newUUID = author.books[0];
      newUUID.should.be.a.String;
      h.author.hydrate(author, function(err, author) {
        //console.log('author rehydrated:', author);
        author.books[0].bookId.should.equal(newUUID);
        // dehydrate again with an existing uuid to ensure it stays the same
        h.author.dehydrate(author, function(err, author) {
          //console.log('author redehydrated:', author);
          author.books[0].should.eql(newUUID);
          done();
        });
      });
    });
  });



  it('should dehydrate and hydrate an object using separate leveldbs', function(done) {

    var Book = db2;

    var h = hydrator({
      types: {
        author: {
          books: {
            db: Book,
            uuidField: 'bookId'
          }
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
      //console.log('author dehydrated:', author);
      var newUUID = author.books[0];
      newUUID.should.be.a.String;
      h.author.hydrate(author, function(err, author) {
        //console.log('author rehydrated:', author);
        author.books[0].bookId.should.equal(newUUID);
        done();
      });
    });
  });




});