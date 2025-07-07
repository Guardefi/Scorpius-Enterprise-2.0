var process$1 = require('process');
var path = require('path');
var url = require('url');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var process__default = /*#__PURE__*/_interopDefault(process$1);
var path__default = /*#__PURE__*/_interopDefault(path);
var url__default = /*#__PURE__*/_interopDefault(url);

function pathKey(options = {}) {
	const {
		env = process.env,
		platform = process.platform
	} = options;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(env).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
}

function npmRunPath(options = {}) {
	const {
		cwd = process__default.default.cwd(),
		path: path_ = process__default.default.env[pathKey()],
		execPath = process__default.default.execPath,
	} = options;

	let previous;
	const cwdString = cwd instanceof URL ? url__default.default.fileURLToPath(cwd) : cwd;
	let cwdPath = path__default.default.resolve(cwdString);
	const result = [];

	while (previous !== cwdPath) {
		result.push(path__default.default.join(cwdPath, 'node_modules/.bin'));
		previous = cwdPath;
		cwdPath = path__default.default.resolve(cwdPath, '..');
	}

	// Ensure the running `node` binary is used.
	result.push(path__default.default.resolve(cwdString, execPath, '..'));

	return [...result, path_].join(path__default.default.delimiter);
}

function npmRunPathEnv({env = process__default.default.env, ...options} = {}) {
	env = {...env};

	const path = pathKey({env});
	options.path = env[path];
	env[path] = npmRunPath(options);

	return env;
}

exports.npmRunPath = npmRunPath;
exports.npmRunPathEnv = npmRunPathEnv;
