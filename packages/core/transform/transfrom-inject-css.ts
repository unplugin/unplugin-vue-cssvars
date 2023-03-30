import MagicString from 'magic-string'
import type { ImportStatement } from '../parser'
// TODO: unit test
export function transformInjectCSS(code: string, importer: Array<ImportStatement>) {
  const mgc = new MagicString(code)
  importer.forEach((imp) => {
    mgc.overwrite(imp.start!, imp.end!, '')
  })
  return mgc.toString()
    .replaceAll('@import ;', '')
    .replaceAll('v-bind-m', 'v-bind')
}
