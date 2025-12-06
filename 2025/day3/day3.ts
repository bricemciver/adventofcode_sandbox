import { processFile } from "./common-utils";

const findMaxVoltage = (line: string): number => {
    // Transverse the line from right to left and find the largest digit
    const numberOfDigits = 12;
    if (line.length < numberOfDigits) {
        throw new Error(`Line must be at least ${numberOfDigits} digits long: ${line}`);
    }
    // Create an array the length of numberOfDigits to hold the digits
    const arrayOfDigits: number[] = new Array(numberOfDigits).fill(0);
    
    let maxVoltage = -1;
    let leftPos = -1;
    let digitPos = -1;
    for (let i = 0; i < numberOfDigits; i++) {
        maxVoltage = -1;
        digitPos = -1;
        for (let j = line.length - (numberOfDigits - i); j > leftPos; j--) {
            const digit = parseInt(line.charAt(j), 10);
            if (!Number.isNaN(digit) && digit >= maxVoltage) {
                maxVoltage = digit;
                arrayOfDigits[i] = digit;
                digitPos = j;
            }
        }
        leftPos = digitPos;
    }
    // Convert the array of digits into a number
    return parseInt(arrayOfDigits.join(''), 10);
}

/** CLI runner when executed directly. */
if (require.main === module) {
    const file = process.argv[2] ?? '2025/day3.input.txt';
    (async () => {
        console.log(`Reading lines from: ${file}`);
        let count = 0;
        const voltageArray: number[] = [];
        await processFile(file, (line, idx) => {
            const maxVoltage = findMaxVoltage(line);
            voltageArray.push(maxVoltage);
            console.log(`Line ${idx + 1}: Max Voltage = ${maxVoltage}`);
            count += 1;
        });
        console.log(`Processed ${count} lines from ${file}`);
        const sum = voltageArray.reduce((acc, val) => acc + val, 0);
        console.log(`Sum of max voltages: ${sum}`);
    })().catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });
}