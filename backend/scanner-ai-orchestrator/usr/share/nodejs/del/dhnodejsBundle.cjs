var node_util = require('node:util');
var path = require('node:path');
var process = require('node:process');
var globby = require('globby');
var isGlob = require('is-glob');
var slash = require('slash');
var gracefulFs = require('graceful-fs');
var isPathCwd = require('is-path-cwd');
var isPathInside = require('is-path-inside');
var rimraf = require('rimraf');
var pMap = require('p-map');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var path__default = /*#__PURE__*/_interopDefault(path);
var process__default = /*#__PURE__*/_interopDefault(process);
var isGlob__default = /*#__PURE__*/_interopDefault(isGlob);
var slash__default = /*#__PURE__*/_interopDefault(slash);
var gracefulFs__default = /*#__PURE__*/_interopDefault(gracefulFs);
var isPathCwd__default = /*#__PURE__*/_interopDefault(isPathCwd);
var isPathInside__default = /*#__PURE__*/_interopDefault(isPathInside);
var rimraf__default = /*#__PURE__*/_interopDefault(rimraf);
var pMap__default = /*#__PURE__*/_interopDefault(pMap);

const rimrafP = node_util.promisify(rimraf__default.default);

const rimrafOptions = {
	glob: false,
	unlink: gracefulFs__default.default.unlink,
	unlinkSync: gracefulFs__default.default.unlinkSync,
	chmod: gracefulFs__default.default.chmod,
	chmodSync: gracefulFs__default.default.chmodSync,
	stat: gracefulFs__default.default.stat,
	statSync: gracefulFs__default.default.statSync,
	lstat: gracefulFs__default.default.lstat,
	lstatSync: gracefulFs__default.default.lstatSync,
	rmdir: gracefulFs__default.default.rmdir,
	rmdirSync: gracefulFs__default.default.rmdirSync,
	readdir: gracefulFs__default.default.readdir,
	readdirSync: gracefulFs__default.default.readdirSync,
};

function safeCheck(file, cwd) {
	if (isPathCwd__default.default(file)) {
		throw new Error('Cannot delete the current working directory. Can be overridden with the `force` option.');
	}

	if (!isPathInside__default.default(file, cwd)) {
		throw new Error('Cannot delete files/directories outside the current working directory. Can be overridden with the `force` option.');
	}
}

function normalizePatterns(patterns) {
	patterns = Array.isArray(patterns) ? patterns : [patterns];

	patterns = patterns.map(pattern => {
		if (process__default.default.platform === 'win32' && isGlob__default.default(pattern) === false) {
			return slash__default.default(pattern);
		}

		return pattern;
	});

	return patterns;
}

async function deleteAsync(patterns, {force, dryRun, cwd = process__default.default.cwd(), onProgress = () => {}, ...options} = {}) {
	options = {
		expandDirectories: false,
		onlyFiles: false,
		followSymbolicLinks: false,
		cwd,
		...options,
	};

	patterns = normalizePatterns(patterns);

	const paths = await globby.globby(patterns, options);
	const files = paths.sort((a, b) => b.localeCompare(a));

	if (files.length === 0) {
		onProgress({
			totalCount: 0,
			deletedCount: 0,
			percent: 1,
		});
	}

	let deletedCount = 0;

	const mapper = async file => {
		file = path__default.default.resolve(cwd, file);

		if (!force) {
			safeCheck(file, cwd);
		}

		if (!dryRun) {
			await rimrafP(file, rimrafOptions);
		}

		deletedCount += 1;

		onProgress({
			totalCount: files.length,
			deletedCount,
			percent: deletedCount / files.length,
		});

		return file;
	};

	const removedFiles = await pMap__default.default(files, mapper, options);

	removedFiles.sort((a, b) => a.localeCompare(b));

	return removedFiles;
}

function deleteSync(patterns, {force, dryRun, cwd = process__default.default.cwd(), ...options} = {}) {
	options = {
		expandDirectories: false,
		onlyFiles: false,
		followSymbolicLinks: false,
		cwd,
		...options,
	};

	patterns = normalizePatterns(patterns);

	const files = globby.globbySync(patterns, options)
		.sort((a, b) => b.localeCompare(a));

	const removedFiles = files.map(file => {
		file = path__default.default.resolve(cwd, file);

		if (!force) {
			safeCheck(file, cwd);
		}

		if (!dryRun) {
			rimraf__default.default.sync(file, rimrafOptions);
		}

		return file;
	});

	removedFiles.sort((a, b) => a.localeCompare(b));

	return removedFiles;
}

exports.deleteAsync = deleteAsync;
exports.deleteSync = deleteSync;
