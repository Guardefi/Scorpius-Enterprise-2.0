const { isStream, isWritableStream, isReadableStream, isDuplexStream, isTransformStream } = require('./dhnodejsBundle.cjs');

const res = (...args) => {
    return isStream(...args);
}
// Old API
res.writable = isWritableStream;
res.readable = isReadableStream;
res.duplex = isDuplexStream;
res.transform = isTransformStream;
// new API
res.isStream = isStream;
res.isWritableStream = isWritableStream;
res.isReadableStream = isReadableStream;
res.isDuplexStream = isDuplexStream;
res.isTransformStream = isTransformStream;

module.exports = res;
