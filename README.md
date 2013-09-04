level-sets
==========

Buckets of unique keys for level.

`npm install level-sets`

Usage
=====

```javascript
var sets = require('level-sets')
  , async = require('async')
  , assert = require('assert')
  ;

var store = sets(__dirname+'/teststore', 'test')

var tests =
  [ ['key', 'test1']
  , ['key', 'test2']
  , ['key', 'test1']
  , ['key2', 'test1']
  , ['key2', 'test1']
  , ['key2', 'test1']
  , ['key2', 'test4']
  ]

async.each(tests, function (k, cb) {
  store.put(k[0], k[1], cb)
}, function (e) {
  if (e) throw e
  store.sum(function (e, total) {
    if (e) throw e
    assert.equal(total, 4)

    store.sum(true, function (e, rows) {
      if (e) throw e
      assert.equal(rows[0].key, 'key')
      assert.equal(rows[1].key, 'key2')
      assert.equal(rows[0].total, 2)
      assert.equal(rows[1].total, 2)

      store.get('key', function (e, arr) {
        assert.equal(arr.length, 2)

        store.get('key2', function (e, arr) {
          assert.equal(arr.length, 2)

        })
      })
    })
  })
})
```
