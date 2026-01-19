import { writeFile, readFile } from 'fs/promises'
import { resolve, extname } from 'path'
import { pathToFileURL } from 'url'

const mapTheme = ([key, value]) => {
  if (typeof value === 'string') return [`--${key}: ${value}`]
  return Object.entries(value).flatMap(([nestedKey, nestedValue]) => {
    const newKey = nestedKey === 'DEFAULT' ? key : `${key}-${nestedKey}`
    return mapTheme([newKey, nestedValue])
  })
}

const isThemeObject = (val) => {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false
  const values = Object.values(val)
  if (values.length === 0) return false
  return values.every((v) => typeof v === 'string' || (typeof v === 'object' && v !== null))
}

async function buildTheme(inputPath, outputPath, prefix) {
  const resolved = resolve(inputPath)
  let theme

  const ext = extname(resolved).toLowerCase()

  if (ext === '.json' || ext === '.json5') {
    const raw = await readFile(resolved, { encoding: 'utf-8' })
    if (ext === '.json5') {
      const JSON5 = (await import('json5')).default ?? (await import('json5'))
      theme = JSON5.parse(raw)
    } else {
      theme = JSON.parse(raw)
    }
  } else {
    const fileUrl = pathToFileURL(resolved).href
    const mod = await import(fileUrl)

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

  let lines = Object.entries(theme).flatMap(mapTheme)
  if (prefix) {
    const clean = prefix.toString().replace(/^[-\s]+|[-\s]+$/g, '').replace(/\s+/g, '-')
    if (clean.length > 0) lines = lines.map((line) => line.replace(/^--/, `--${clean}-`))
  }

  const content = [
    ':root {',
    ...lines.map((line) => `  ${line};`),
    '}',
    '',
  ].join('\n')

  await writeFile(outputPath, content, { encoding: 'utf-8' })
  console.log(`WROTE ${outputPath}`)
}

if (process.argv.length < 4) {
  console.error('Usage: node index.test-runner.js <input> <output> [prefix]')
  process.exit(2)
}

const input = process.argv[2]
const output = process.argv[3]
const prefix = process.argv[4]

buildTheme(input, output, prefix).catch((err) => {
  console.error('ERROR', err.message)
  process.exit(1)
})
