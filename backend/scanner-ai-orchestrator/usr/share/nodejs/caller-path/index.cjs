var callerCallsite = require('caller-callsite');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var callerCallsite__default = /*#__PURE__*/_interopDefault(callerCallsite);

function callerpath({depth = 0} = {}) {
	const callsite = callerCallsite__default.default({depth});
	return callsite && callsite.getFileName();
}

module.exports = callerpath;
