var glob = require("glob");

var _require = require("fs"),
    writeFileSync = _require.writeFileSync,
    existsSync = _require.existsSync,
    readFileSync = _require.readFileSync;

var _require2 = require("path"),
    join = _require2.join,
    dirname = _require2.dirname;

var _require3 = require("chai"),
    assert = _require3.assert;

var diff = require("jest-diff");

var _require4 = require("/usr/share/nodejs/jest-diff/build/constants"),
    NO_DIFF_MESSAGE = _require4.NO_DIFF_MESSAGE;

var THROWS_TXT = "throws.txt";

var NOOP_FN = function NOOP_FN() {
  return "";
};

export function getFixtures(dirname) {
  for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }

  var dir = join.apply(void 0, [dirname].concat(rest));
  var fixtures = glob.sync(dir);

  if (fixtures.length === 0) {
    throw new Error("No fixtures found in " + JSON.stringify(dir));
  }

  return fixtures;
}

function getThrowsFile(dirname) {
  var throwsFile = join(dirname, THROWS_TXT);

  if (existsSync(throwsFile)) {
    return readFileSync(throwsFile, "utf8").trim();
  }
}

export function compareStrings(actual, expected) {
  actual = actual.trim();
  expected = expected.trim();
  var out = diff(expected, actual);

  if (out !== null && out !== NO_DIFF_MESSAGE) {
    throw new Error("\n" + out);
  }

  assert.equal(actual, expected);
}
export function compareWithExpected(fixtures) {
  var pre = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : NOOP_FN;
  var expectedFilename = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "expected.wast";
  fixtures.forEach(function (suite) {
    it(suite, function () {
      var input = readFileSync(suite, "utf8");
      var expectedThrows = getThrowsFile(dirname(suite));
      var actual = "";

      try {
        actual = pre(input, suite);

        if (typeof expectedThrows !== "undefined") {
          throw new Error("Expected parser error \"".concat(expectedThrows, "\", but got none."));
        }
      } catch (e) {
        if (expectedThrows === undefined) {
          throw e;
        }

        compareStrings(e.message, expectedThrows);
        return;
      }

      var expectedFile = join(dirname(suite), expectedFilename);
      var expected;

      try {
        expected = readFileSync(expectedFile, "utf8");
      } catch (e) {
        expected = actual;
        writeExpectedFile(expectedFile, actual);
      }

      compareStrings(actual, expected);
    });
  });
}
export function compare(fixtures) {
  var getActual = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : NOOP_FN;
  var getExpected = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : NOOP_FN;
  fixtures.forEach(function (suite) {
    it(suite, function () {
      var input = readFileSync(suite, "utf8");
      var actual = getActual(input, suite);
      var expected = getExpected(input, suite);
      compareStrings(actual, expected);
    });
  });
}

function writeExpectedFile(expectedFile, content) {
  writeFileSync(expectedFile, content);
  console.log("Write expected file", expectedFile);
}

export * from "./fake-compiler";