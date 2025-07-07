var stripAnsi = require('strip-ansi')
var wcwidth = require('wcwidth.js')

module.exports = function(str) {
  return wcwidth(stripAnsi(str))
}
