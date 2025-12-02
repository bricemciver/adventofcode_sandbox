# adventofcode_sandbox — TypeScript skeleton

This repository contains a small TypeScript skeleton to read a text file and process it line-by-line.

Files added/updated:

- `2025/day1.ts` — exports `processFile(filePath, onLine)` and includes a small CLI runner example.
- `package.json` — scripts and devDependencies for TypeScript development.
- `tsconfig.json` — TypeScript compiler settings.

Quick start

1. Install dev dependencies:

```bash
npm install
```

2. Run the TypeScript file directly with `ts-node` (provided by devDependencies):

```bash
npm run start -- 2025/day1.input.txt
```

3. Or compile and run the output JS:

```bash
npm run build
npm run start:dist -- 2025/day1.input.txt
```

Edit `2025/day1.ts` and replace the example `onLine` callback with your puzzle logic.
