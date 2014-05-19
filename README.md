# level-hydrator

Normalize data across leveldbs (or sublevels)

[![build status](https://api.travis-ci.org/will123195/level-hydrator.svg)](http://travis-ci.org/will123195/level-hydrator)

## Example

```js
var level = require('level');
var sub = require('level-sublevel');
var db = sub(level('/tmp/example-db'));
var hydrator = require('level-hydrator');

// init dbs
var Author = db.sublevel('author');
var Book = db.sublevel('book');
var Image = db.sublevel('image');

// configure a hydrator called `author` for two hydratable properties: `books` and `photo`
var h = hydrator({
  author: {
    books: {
      db: Book,
      uuid: 'bookId'
    },
    photo: {
      db: Image,
      uuid: 'imageId'
    }
  }
});
// now you can do: h.author.hydrate(obj, cb)

// a new object with nested objects
var author = {
  name: 'Jack Kerouac',
  books: [
    {
      title: 'On the Road',
      year: 1957
    }
  ],
  photo: {
    url: 'http://bit.ly/1nf9eT9',
    width: 220,
    height: 220
  }
};

// example of dehydrating, then hydrating it back
h.author.dehydrate(author, function(err, author) {
  /*
    author:
    {
      name: 'Jack Kerouac',
      books: [ 'b9ac7e0a-61d6-461c-8372-02b28b8a0cc0' ],
      photo: '1343bcc0-df9e-11e3-8b68-0800200c9a66'
    }
  */

  h.author.hydrate(author, function(err, author) {
    /*
      author:
      {
        name: 'Jack Kerouac',
        books: [
          {
            bookId: 'b9ac7e0a-61d6-461c-8372-02b28b8a0cc0',
            title: 'On the Road',
            year: 1957
          }
        ],
        photo: {
          imageId: '1343bcc0-df9e-11e3-8b68-0800200c9a66'
          url: 'http://bit.ly/1nf9eT9',
          width: 220,
          height: 220
        }
      }
    */
  });
});
```
