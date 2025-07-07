import process from 'node:process';
import once from 'once';
import signalExit from 'signal-exit';

const restoreCursor = once(() => {
	signalExit(() => {
		process.stderr.write('\u001B[?25h');
	}, {alwaysLast: true});
});

export default restoreCursor;
