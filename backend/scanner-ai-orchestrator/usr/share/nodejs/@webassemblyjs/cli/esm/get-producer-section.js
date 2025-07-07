#!/usr/bin/env node

var _require = require("@webassemblyjs/wasm-parser"),
    decode = _require.decode;

var _require2 = require("@webassemblyjs/ast"),
    traverse = _require2.traverse;

var _require3 = require("fs"),
    readFileSync = _require3.readFileSync;

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

var filename = process.argv[2];

if (typeof filename === "undefined") {
  throw new Error("Missing file");
}

var decoderOpts = {
  ignoreCodeSection: true,
  ignoreDataSection: true
}; // $FlowIgnore: this is correct but not correctly documented

var buff = toArrayBuffer(readFileSync(filename, null));
var ast = decode(buff, decoderOpts);
var found = false;
traverse(ast, {
  ProducersSectionMetadata: function ProducersSectionMetadata(_ref) {
    var node = _ref.node;
    node.producers.forEach(function (entry) {
      entry.forEach(function (producer) {
        console.log(producer.name, producer.version);
      });
    });
    found = true;
  }
});

if (found === false) {
  console.error("no producer section found");
}