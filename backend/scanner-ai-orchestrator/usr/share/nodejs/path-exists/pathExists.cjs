var fs = require('fs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var fs__default = /*#__PURE__*/_interopDefault(fs);

async function pathExists(path) {
	try {
		await fs.promises.access(path);
		return true;
	} catch {
		return false;
	}
}

function pathExistsSync(path) {
	try {
		fs__default.default.accessSync(path);
		return true;
	} catch {
		return false;
	}
}

exports.pathExists = pathExists;
exports.pathExistsSync = pathExistsSync;
