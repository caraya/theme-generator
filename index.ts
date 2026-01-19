import { writeFile, readFile } from 'fs/promises'
import { resolve, extname } from 'path'
import { pathToFileURL } from 'url'
import { flattenColorsArrayToTheme } from './utils/flattenColors'
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
 * @param inputPath  Path to a JS/TS module exporting a `theme` object or a JSON file.
 * @param outputPath Path to the CSS file to write.
 */
async function buildTheme(inputPath: string, outputPath: string, prefix?: string) {
  try {
    const resolved = resolve(inputPath)
    let theme: any

    const ext = extname(resolved).toLowerCase()

    if (ext === '.json' || ext === '.json5') {
      const raw = await readFile(resolved, { encoding: 'utf-8' })
      if (ext === '.json5') {
        let JSON5: any
        try {
          JSON5 = (await import('json5')).default ?? (await import('json5'))
        } catch (e) {
          throw new Error("Parsing .json5 requires the 'json5' package. Install it: npm install json5")
        }
        theme = JSON5.parse(raw)
      } else {
        theme = JSON.parse(raw)
      }
    } else {
      const fileUrl = pathToFileURL(resolved).href
      const mod = await import(fileUrl)

      const isThemeObject = (val: any): boolean => {
        if (!val || typeof val !== 'object' || Array.isArray(val)) return false
        const values = Object.values(val)
        if (values.length === 0) return false
        return values.every((v) => typeof v === 'string' || (typeof v === 'object' && v !== null))
      }

      const exportedThemeCandidates = Object.values(mod).filter(isThemeObject)
      if (exportedThemeCandidates.length === 1) {
        theme = exportedThemeCandidates[0]
      } else if (mod.default && isThemeObject(mod.default)) {
        theme = mod.default
      } else if (mod.theme && isThemeObject(mod.theme)) {
        theme = mod.theme
      } else if (isThemeObject(mod)) {
        theme = mod
      } else {
        throw new Error('Theme file must export a theme object (default, named `theme`, or a single exported object)')
      }
    }

    if (!theme || typeof theme !== 'object') {
      throw new Error('Theme file did not export an object')
    }

    // Special-case: a colors.json5 file may be an array of categories
    // with `colors` arrays. Flatten that schema into a simple
    // string-valued theme object the rest of the generator can use.
    if (Array.isArray(theme)) {
      theme = flattenColorsArrayToTheme(theme)
    }

    let lines = Object.entries(theme).flatMap(mapTheme)

    // sanitize prefix and apply if provided
    if (prefix) {
      const clean = prefix.toString().replace(/^[-\s]+|[-\s]+$/g, '').replace(/\s+/g, '-')
      if (clean.length > 0) {
        lines = lines.map((line) => line.replace(/^--/, `--${clean}-`))
      }
    }
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
  .argument('<input>', 'path to the theme JS/TS module or JSON/JSON5 file')
  .argument('<output>', 'path to write the generated CSS file')
  .option('-p, --prefix <prefix>', 'prefix to prepend to variable names')
  .action((input, output, options) => {
    buildTheme(input, output, options.prefix)
  })

program.parse(process.argv)
