# Theme Generator

This package generates a CSS file from a theme object.

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the build command:
   ```bash
   npm run build
   ```
   This will generate `src/theme.css` from `theme.js`.

## Files

- `index.ts`: Script that reads `theme.js` and outputs CSS.
- `theme.js`: Theme object with color definitions.
- `src/theme.css`: Generated CSS file.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project metadata and scripts.
