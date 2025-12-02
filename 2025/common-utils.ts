import * as fs from 'node:fs';
import * as readline from 'node:readline';

/**
 * Process a file line-by-line.
 *
 * @param filePath - path to the input file
 * @param onLine - callback called for each line. Can return a Promise for async work.
 */
export async function processFile(
	filePath: string,
	onLine: (line: string, index: number) => void | Promise<void>
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
	stream.on('error', (err) => reject(err));

	const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
	let idx = 0;

	rl.on('line', async (line: string) => {
			try {
				await Promise.resolve(onLine(line, idx));
				idx += 1;
			} catch (err) {
				rl.close();
				stream.destroy();
				reject(err);
			}
		});
		rl.on('close', () => resolve());
	});
}