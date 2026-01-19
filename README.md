# Theme Generator

A simple CLI tool that reads a theme object (from JS/TS/JSON/JSON5) and generates a CSS file with custom properties.

## Prerequisites

- [Node.js](https://nodejs.org/) v14+  
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)  
- [`tsx`](https://github.com/esbuild-kit/tsx) (installed as a dev dependency)

## Installation

1. Clone or download this repository  
2. From the project root, install dependencies:

```bash
npm install
```

## Usage

### Build via npm script

A convenience script is provided in package.json:

```bash
npm run build
# which runs: tsx index.ts theme.js src/theme.css
```

- **theme.js** – path to your theme module or `.json`/`.json5` file. Supported inputs:
  - JS/TS module exporting a theme object (default export, a named `theme` export, the module root, or a single exported object)
  - `.json` or `.json5` files containing the theme object
- **src/theme.css** – path where the generated CSS will be written

### Direct CLI invocation

Make the script executable and run it directly:

```bash
chmod +x index.ts

./index.ts <input-theme-module> <output-css-file>
```

#### Options

- `-p, --prefix <prefix>` — prefix to prepend to generated CSS variable names. Example: `--prefix ui` will produce variables like `--ui-primary` and `--ui-secondary-dark`.

Example with prefix:

```bash
./index.ts --prefix ui theme.js src/theme.css
```

## Example

```bash
./index.ts theme.js src/theme.css
```

## Help & Version

```bash
# Show help
index.ts --help

# Show version
index.ts --version
```

## theme.js format

Your theme input may be:

- A JS/TS module exporting a theme object. The generator will accept:
  - a default export (`export default { ... }`)
  - a named `theme` export (`export const theme = { ... }`)
  - the module root if it itself is the object (`export const myTheme = { ... }` and the module exports only that object)
  - a module that exports a single object under any name (the generator will pick the single object export)

- A `.json` or `.json5` file containing the theme object (JSON5 support is included via the `json5` dependency)

Example JS/JSON inputs:

```js
// theme.js (example)
export default {
  primary: '#3490dc',
  secondary: {
    DEFAULT: '#ffed4a',
    dark: '#f9d71c'
  }
}
```

```json5
// theme.json5 (example)
{
  primary: '#3490dc',
  secondary: { DEFAULT: '#ffed4a', dark: '#f9d71c' },
}
```

Nested objects will be flattened to CSS variables like:

```css
:root {
  --primary: #3490dc;
  --secondary: #ffed4a;
  --secondary-dark: #f9d71c;
}
```

## License

MIT
