export type ColorEntry = { name?: string; oklch?: string; rgb?: string }

const slug = (s: string) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

/**
 * Flatten a colors.json5-style array into a simple theme object where
 * keys are ready to be turned into CSS custom-properties. Example output:
 * { 'color-white-oklch': 'oklch(...)', 'color-white-rgb': '#fff' }
 */
export function flattenColorsArrayToTheme(input: any): Record<string, string> {
  const out: Record<string, string> = {}

  if (!Array.isArray(input)) return out

  input.forEach((category: any) => {
    if (!category || !Array.isArray(category.colors)) return

    category.colors.forEach((c: ColorEntry) => {
      const name = c.name || (c as any).label
      if (!name) return

      const base = `color-${slug(name)}`

      if (typeof c.oklch === 'string') out[`${base}-oklch`] = c.oklch
      if (typeof c.rgb === 'string') out[`${base}-rgb`] = c.rgb
    })
  })

  return out
}
