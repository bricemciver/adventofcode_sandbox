import { processFile } from "./common-utils";

const processRanges = (line: string): number[] => {
    const parts = line.split(',');
    if (parts.length < 2) {
        throw new Error(`Invalid line format: ${line}`);
    }
    const repeatNumbers: number[] = [];
    // Parse the two or more ranges
    for (const part of parts) {
        const rangeParts = part.split('-').map(Number);
        if (rangeParts.length !== 2 || rangeParts.some(Number.isNaN)) {
            throw new Error(`Invalid range format: ${part}`);
        }
        // Check all numbers in the range for a pattern of a subnumber repeating twice
        // Subnumber can be any length at most half the length of the number
        // Subnumber can repeat any number of times as long as it is contiguous and fills the entire number
        const [start, end] = rangeParts;
        for (let num = start; num <= end; num++) {
            const numStr = num.toString();
            const len = numStr.length;
            for (let subLen = 1; subLen <= Math.floor(len / 2); subLen++) {
                if (len % subLen === 0) {
                    const subNum = numStr.slice(0, subLen);
                    const repeated = subNum.repeat(len / subLen);
                    if (repeated === numStr) {
                        repeatNumbers.push(num);
                        break; // Found a repeating pattern, no need to check further
                    }
                }
            }
        }
    }
    return repeatNumbers
}

/** CLI runner when executed directly. */
if (require.main === module) {
    const file = process.argv[2] ?? '2025/day2.input.txt';
    (async () => {
        console.log(`Reading lines from: ${file}`);
        let count = 0;
        await processFile(file, (line, idx) => {
            const repeatNumbers = processRanges(line);
            count += 1;
            // Sum all of the repeat numbers found
            console.log(`Sum of all repeating subnumbers: ${repeatNumbers.reduce((a, b) => a + b, 0)}`)
        });
        console.log(`Processed ${count} lines from ${file}`);
    })().catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
}
