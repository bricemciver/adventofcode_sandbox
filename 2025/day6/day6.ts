import { processFile } from "./common-utils";

const transposeColumn = (column: string[]): number[] => {
	// Get string length
	const output: number[] = [];
	const length = column[0].length;
	for (let i = length - 1; i >= 0; i--) {
		let result = 0;
        let digitPlace = 0;
		for (let j = column.length - 1; j >= 0; j--) {
			const char = column[j].charAt(i).trim();
			if (char) {
				const digit = parseInt(char, 10);
				// Only process non-empty characters
				result += digit * (10 ** digitPlace);
                digitPlace += 1;
			}
		}
        if (result !== 0) {
		    output.push(result);
        }
	}
    console.log("transposed column: ", output);
	return output;
};

/** CLI runner when executed directly. */
if (require.main === module) {
	const file = process.argv[2] ?? "2025/day6.input.txt";
	const lines: string[] = [];
	(async () => {
		console.log(`Reading lines from: ${file}`);
		await processFile(file, (line, idx) => {
			lines.push(line);
		});
		// Determine where to split the string by looking at the last line of the array
		// Whenever there is a new operator, that is the start of a new column
		const operators = lines
			.pop()
			?.split(/([+*]\s+)/gm)
			.filter((item) => item !== "");
		if (!operators) {
			throw new Error("No operators found");
		}
		// Get the indicies that we need to split on
		const indicies = [0];
		operators?.map((item) =>
			indicies.push(indicies[indicies.length - 1] + item.length),
		);
		console.log(indicies);
		const problemArray: string[][] = [];
		for (let i = 0; i < lines.length; i++) {
			const numberRow: string[] = [];
			for (let j = 0; j < indicies.length - 1; j++) {
				numberRow.push(lines[i].substring(indicies[j], indicies[j + 1]));
			}
			problemArray.push(numberRow);
		}
		problemArray.push(operators);
		console.log(problemArray);

		// Transpose the array
		const transposed = problemArray[0].map((_, colIndex) =>
			problemArray.map((row) => row[colIndex]),
		);
		problemArray.length = 0; // Clear the original array
		problemArray.push(...transposed); // Replace with transposed data
		console.log(problemArray);

		// Perform the math
		let grandTotal = 0;
		for (let i = 0; i < problemArray.length; i++) {
			// Get the operator
			const operator = problemArray[i].pop()?.trim();
			console.log(`${operator} ${problemArray[i]}`);
            // transpose the column
            const numbers = transposeColumn(problemArray[i]);
			let total = 0;
			if (operator === "+") {
                total = numbers.reduce((a, b) => a + b)
            }
            if (operator === "*") {
                total = numbers.reduce((a, b) => a * b)
            }
			console.log(`Total for problem ${i}: ${total}`);
			grandTotal += total;
		}
		console.log(`Grand total: ${grandTotal}`);
	})().catch((err) => {
		console.error("Error:", err);
		process.exit(1);
	});
}
