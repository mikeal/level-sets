var sets = require('./')
  , async = require('async')
  , ok = require('okdone')
  , cleanup = require('cleanup')
  , assert = require('assert')
  , rimraf = require('rimraf')
  ;

var store = sets(__dirname+'/teststore', 'test')

var d = cleanup(function (error) {
  rimraf.sync(__dirname+'/teststore')
  ok.done()
})

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
    ok('total')
    store.sum(true, function (e, rows) {
      if (e) throw e
      assert.equal(rows[0].key, 'key')
      assert.equal(rows[1].key, 'key2')
      assert.equal(rows[0].total, 2)
      assert.equal(rows[1].total, 2)
      ok('group')
      store.get('key', function (e, arr) {
        assert.equal(arr.length, 2)
        ok('get')
        store.get('key2', function (e, arr) {
          assert.equal(arr.length, 2)
          ok('get key2')
          d.cleanup()
        })
      })
    })
  })
})