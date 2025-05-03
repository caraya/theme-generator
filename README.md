# Theme Generator

A simple CLI tool that reads a theme object from a JS/TS module and generates a CSS file with custom properties.

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

- **theme.js** – path to your theme module (must export a default object)
- **src/theme.css** – path where the generated CSS will be written

### Direct CLI invocation

Make the script executable and run it directly:

```bash
chmod +x index.ts

./index.ts <input-theme-module> <output-css-file>
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

Your theme module must export a default object:

```js
// theme.js
export default {
  primary: '#3490dc',
  secondary: {
    DEFAULT: '#ffed4a',
    dark: '#f9d71c'
  },
  // ... more keys/nested objects
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
