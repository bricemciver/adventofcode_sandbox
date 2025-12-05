import { processFile } from "./common-utils";

class RangeSet {
    private ranges: [number, number][];

    constructor(ranges: [number, number][]) {
        if (ranges.length === 0) {
            this.ranges = [];
            return;
        }

        // Sort ranges by start value
        const sorted = [...ranges].sort((a, b) => a[0] - b[0]);

        // Merge overlapping or adjacent ranges
        this.ranges = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const current = sorted[i];
            const last = this.ranges[this.ranges.length - 1];
            
            if (current[0] <= last[1] + 1) {
                // Overlapping or adjacent ranges, merge them
                last[1] = Math.max(last[1], current[1]);
            } else {
                this.ranges.push(current);
            }
        }
    }

    hasNumber(num: number): boolean {
        let left = 0;
        let right = this.ranges.length - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const [start, end] = this.ranges[mid];
            if (num >= start && num <= end) {
                return true;
            } else if (num < start) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return false;
    }

    countNumbersInRange(): number {
        return this.ranges.reduce((acc, [start, end]) => acc + (end - start + 1), 0);
    }
}

const processFreshIngredients = (line: string): [number,number] => {
    const range = line.split("-", 2).map((s) => parseInt(s, 10))
    return [range[0], range[1]];
};

const processAvailableIngredients = (
	line: string,
	freshIngredients: RangeSet,
): boolean => {
    return freshIngredients.hasNumber(parseInt(line, 10));
};

/** CLI runner when executed directly. */
if (require.main === module) {
	const file = process.argv[2] ?? "2025/day5.input.txt";
	const freshIngredients: [number, number][] = [];
	let availableIngredients: number = 0;
	let processingFreshIngredients = true;
    let rangeSet: RangeSet;
	(async () => {
		console.log(`Reading lines from: ${file}`);
		await processFile(file, (line, idx) => {
			// Before the blank line, we are processing fresh ingredient ranges
			// After the blank line, we are processing available ingredient IDs
			if (line === "") {
				processingFreshIngredients = false;
                rangeSet = new RangeSet(freshIngredients);
                console.log(`Fresh ingredient ranges consider a total of ${rangeSet.countNumbersInRange()} ingredient IDs to be fresh.`);
				return;
			}
			if (processingFreshIngredients) {
                freshIngredients.push(processFreshIngredients(line));
			} else {
				if (processAvailableIngredients(line, rangeSet)) {
					availableIngredients += 1;
				}
			}
		});
        console.log(`Available ingredients: ${availableIngredients}`);
	})().catch((err) => {
		console.error("Error:", err);
		process.exit(1);
	});
}
