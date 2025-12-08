import path from "node:path";
import { processFile } from "../common-utils";

const traceBeam = (lines: string[]) => {
    let beamPoints: Map<number, number> = new Map()
    let splitCount = 0;
    let pathCount = 0;
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        // If beamPoints is empty, find the beam
        if (beamPoints.size === 0) {
            beamPoints.set(line.indexOf("S"), 1);
            console.log(`Found starting beam at x=${line.indexOf("S")}, y=${y}`);
            pathCount++;
            continue;
        }
        // Check if the beam splits on this line
        beamPoints.forEach((cnt, beam) => {
            if (line[beam] === "^") {
                console.log(`${cnt} beams split at x=${beam}, y=${y}`);
                pathCount += cnt;
                // increment the cnt of beam-1 and beam+1 by cnt
                beamPoints.set(beam-1, (beamPoints.get(beam-1) ?? 0) + cnt);
                beamPoints.set(beam+1, (beamPoints.get(beam+1) ?? 0) + cnt);
                // decrement the cnt of beam by cnt
                beamPoints.set(beam, (beamPoints.get(beam) ?? 0) - cnt);
                //splitCount++;
            }
        })
    }
    return { beamPoints, splitCount, pathCount };
}


/** CLI runner when executed directly. */
if (require.main === module) {
    const file = process.argv[2] ?? "2025/day7/day7.input.txt";
    const lines: string[] = [];
    (async () => {
        console.log(`Reading lines from: ${file}`);
        await processFile(file, (line, idx) => {
            lines.push(line);
        });
        console.log(traceBeam(lines));
    })().catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });
}
