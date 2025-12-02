/*
 * 2025/day1.ts
 *
 * Skeleton TypeScript program to read a text file and process it line-by-line.
 * Replace the example processing in `onLine` with your problem-specific logic.
 *
 * Usage (after installing deps):
 *   npm run start -- 2025/day1.input.txt
 * or (if you compile):
 *   npm run build
 *   node dist/2025/day1.js 2025/day1.input.txt
 */

import { processFile } from "./common-utils";

const getPositionAndZeroCount = (line: string, curPos: number): [number, number] => {
    // First character indicates direction: 'R' = right, 'L' = left
    const direction = line.charAt(0);
    // The rest of the line is the number of steps to move
    const steps = parseInt(line.slice(1), 10);

    let newPos: number;
    let zeroCount = 0;
    if (direction === 'R') {
        newPos = curPos + steps;
        while (newPos > 99) {
            newPos -= 100;
            zeroCount += 1;
        }
    } else if (direction === 'L') {
        // Special case, treat 0 as 100 if starting from 0 and moving left
        if (curPos === 0) {
            curPos = 100;
        }
        newPos = curPos - steps;
        while (newPos < 0) {
            newPos += 100;
            zeroCount += 1;
        }
        // If we land exactly on 0 after moving left from a positive position
        if (newPos === 0) {
            zeroCount += 1;
        }
    } else {
        throw new Error(`Invalid direction: ${direction}`);
    }
    
    return [newPos, zeroCount];
}

/** CLI runner when executed directly. */
if (require.main === module) {
	const file = process.argv[2] ?? '2025/day1.input.txt';
	(async () => {
		console.log(`Reading lines from: ${file}`);
		let count = 0;
        let totalZeroCount = 0;
        let curPos = 50;
        const positions: number[] = [];
		await processFile(file, (line, idx) => {
            const [newPos, zeroCount] = getPositionAndZeroCount(line, curPos);
            console.log(`Line ${idx + 1}: ${line} => New Position: ${newPos}, Zeros Crossed: ${zeroCount}`);
            curPos = newPos;
			positions.push(curPos);
            totalZeroCount += zeroCount;
			count += 1;
		});
		console.log(`Processed ${count} lines from ${file}`);
        console.log(`Number of times position 0 was crossed: ${totalZeroCount}`);
	})().catch((err) => {
		console.error('Error:', err);
		process.exit(1);
	});
}

