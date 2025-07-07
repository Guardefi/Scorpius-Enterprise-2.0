'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var getCallerFile = require("./");
var chai = require("chai");
var ensurePosix = require("ensure-posix-path");
var expect = chai.expect;
var foo = require('./fixtures/foo');
var bar = require('./fixtures/bar');
describe('getCallerFile', function () {
    var originalStackTraceLimit = Error.stackTraceLimit;
    afterEach(function () { return Error.stackTraceLimit = originalStackTraceLimit; });
    it('gets current caller file', function () {
        expect(ensurePosix(getCallerFile())).to.eql(ensurePosix('/usr/share/nodejs/mocha/lib/runnable.js'));
    });
    it('gets current file, as it is the caller', function () {
        expect(ensurePosix(foo())).to.eql(ensurePosix(__dirname + '/test.js'));
    });
    it('gets another file, as it is the caller', function () {
        expect(ensurePosix(bar())).to.eql(ensurePosix(__dirname + '/fixtures/bar.js'));
    });
    it('throws error if error stackTraceLimit overflow', function () {
        Error.stackTraceLimit = 5;
        expect(function () { return getCallerFile(Error.stackTraceLimit + 1); }).to.throw(TypeError);
    });
    it('throws no errors if incrementing error stackTraceLimit ', function () {
        Error.stackTraceLimit = 5;
        expect(function () { return getCallerFile(Error.stackTraceLimit - 1); }).to.not.throw(TypeError);
    });
});
//# sourceMappingURL=test.js.map