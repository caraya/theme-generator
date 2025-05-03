import { writeFile } from 'fs/promises'
import { resolve } from 'path'
import { pathToFileURL } from 'url'
import { Command } from 'commander'

/**
 * Recursively maps a theme entry into CSS custom-property declarations.
 * @param entry A [key, value] tuple from the theme object.
 * @returns An array of `--key: value` strings.
 */
const mapTheme = ([key, value]: [string, any]): string[] => {
  if (typeof value === 'string') {
    return [`--${key}: ${value}`]
  }

  return Object.entries(value).flatMap(([nestedKey, nestedValue]) => {
    const newKey = nestedKey === 'DEFAULT' ? key : `${key}-${nestedKey}`
    return mapTheme([newKey, nestedValue])
  })
}

/**
 * Reads the theme module, builds a `:root { … }` block of CSS,
 * and writes it to the specified output file.
 *
 * @param inputPath  Path to a JS/TS module exporting a default `theme` object.
 * @param outputPath Path to the CSS file to write.
 */
async function buildTheme(inputPath: string, outputPath: string) {
  try {
    const fileUrl = pathToFileURL(resolve(inputPath)).href
    const { default: theme } = await import(fileUrl)

    const lines = Object.entries(theme).flatMap(mapTheme)
    const content = [
      ':root {',
      ...lines.map((line) => `  ${line};`),
      '}',
      '',
    ].join('\n')

    await writeFile(outputPath, content, { encoding: 'utf-8' })
    console.log(`\x1b[32m✔\x1b[0m CSS file written to ${outputPath}`)
  } catch (err: any) {
    console.error(`\x1b[31m✖\x1b[0m Error: ${err.message}`)
    process.exit(1)
  }
}

const program = new Command()

program
  .name('theme-generator')
  .description('Generate a CSS custom-properties file from a theme module')
  .version('0.1.0')
  .argument('<input>', 'path to the theme JS/TS module')
  .argument('<output>', 'path to write the generated CSS file')
  .action((input, output) => {
    buildTheme(input, output)
  })

program.parse(process.argv)
