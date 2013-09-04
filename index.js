var levelup = require('levelup')
  , byteslice = require('byteslice')
  , opts = { keyEncoding: 'binary' }
  ;

function Store (lev, name) {
  if (typeof lev === 'string') lev = levelup(lev, opts)
  this.lev = lev
  this.bytes = byteslice([name, 'level-sets'])
}
Store.prototype.get = function (key, cb) {
  var opts = {start:this.bytes.encode([key, -1]), end:this.bytes.encode([key, 1]), values:false}
    , reader = this.lev.createReadStream(opts)
    , total = 0
    , self = this
    , rows = []
    ;
  reader.on('data', function (k) {
    k = self.bytes.decode(k)
    var key = k[0]
      , value = k[1]
      ;
    rows.push(value)
  })
  reader.on('end', function () {
    cb(null, rows)
  })
}
Store.prototype.put = function (key, value, cb) {
  var k = this.bytes.encode([key, 0, value])
  this.lev.put(k, ' ', cb)
}
Store.prototype.sum = function (group, cb) {
  var reader = this.lev.createReadStream({values:false})
    , total = 0
    , self = this
    ;

  if (!cb) {
    cb = group
    group = false
  }

  if (group) var rows = []

  reader.on('data', function (k) {
    k = self.bytes.decode(k)
    var key = k[0]
      , value = k[1]
      ;
    total += 1
    if (group) {
      if (!rows[rows.length - 1] || rows[rows.length - 1].key !== key) {
        rows.push({key:key, total:1})
      } else {
        rows[rows.length - 1].total += 1
      }
    }
  })
  reader.on('end', function () {
    if (group) cb(null, rows, total)
    else cb(null, total)
  })
}

module.exports = function (lev, name) {return new Store(lev, name)}