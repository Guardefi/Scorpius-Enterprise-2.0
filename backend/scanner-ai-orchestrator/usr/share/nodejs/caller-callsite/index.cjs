var callsites = require('callsites');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var callsites__default = /*#__PURE__*/_interopDefault(callsites);

function callerCallsite({depth = 0} = {}) {
	const callers = [];
	const callerFileSet = new Set();

	for (const callsite of callsites__default.default()) {
		const fileName = callsite.getFileName();
		const hasReceiver = callsite.getTypeName() !== null && fileName !== null;

		if (!callerFileSet.has(fileName)) {
			callerFileSet.add(fileName);
			callers.unshift(callsite);
		}

		if (hasReceiver) {
			return callers[depth];
		}
	}
}

module.exports = callerCallsite;
