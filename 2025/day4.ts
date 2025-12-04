import { processFile } from "./common-utils";

const processRow = (row: string): boolean[] => {
	return row.split("").map((c) => c === "@");
};

const processArray = (paperWall: boolean[][]): [number, boolean[][]] => {
    // clone the paper wall
	const tmpPaperWall = paperWall.map((row) => row.slice());
	// Transverse the paper wall and count the number of @ that are neighbors of each cell
	let count = 0;
	let result = 0;
	for (let i = 0; i < paperWall.length; i++) {
		for (let j = 0; j < paperWall[i].length; j++) {
			count = 0;
			// Only count if the cell has a paper roll
			if (!paperWall[i][j]) {
				continue;
			}
			for (
				let k = Math.max(0, i - 1);
				k <= Math.min(i + 1, paperWall.length - 1);
				k++
			) {
				for (
					let l = Math.max(0, j - 1);
					l <= Math.min(j + 1, paperWall[i].length - 1);
					l++
				) {
					if (paperWall[k][l] && !(k === i && l === j)) {
						count += 1;
					}
				}
			}
			if (count < 4) {
				result += 1;
                tmpPaperWall[i][j] = false;
			}
		}
	}
	console.log(`Rolls removed: ${result}`);
	return [result, tmpPaperWall];
};

/** CLI runner when executed directly. */
if (require.main === module) {
	const file = process.argv[2] ?? "2025/day4.input.txt";
	(async () => {
		console.log(`Reading lines from: ${file}`);
		let totalCount = 0;
		const paperWall: boolean[][] = [];
		await processFile(file, (line, idx) => {
			paperWall.push(processRow(line));
		});
        let [count, newPaperWall] = processArray(paperWall);
		while (count !== 0) {
			totalCount += count;
            [count, newPaperWall] = processArray(newPaperWall);
		}
		console.log(`Total: ${totalCount}`);
	})().catch((err) => {
		console.error("Error:", err);
		process.exit(1);
	});
}
