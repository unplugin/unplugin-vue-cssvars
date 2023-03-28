import type { ImportStatement } from '../parser/parser-import'

export function transformQuotes(importer: ImportStatement) {
  if (!importer.path.startsWith('"') && !importer.path.endsWith('"')) {
    if (importer.path.startsWith("'") && importer.path.endsWith("'"))
      importer.path = `"${importer.path.slice(1, -1)}"`
    else
      importer.path = `"${importer.path}"`
  }
  return importer
}
