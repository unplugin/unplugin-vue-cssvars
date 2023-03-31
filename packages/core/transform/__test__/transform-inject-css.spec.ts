import { describe, expect, test } from 'vitest'
import { transformInjectCSS } from '../transform-inject-css'
import type { ImportStatement } from '../../parser'

describe('transformInjectCSS', () => {
  test('basic', () => {
    const code = '@import \'some-style.css\';<div v-bind-m="someValue"></div>'
    const importer: ImportStatement[] = [{ start: 0, end: 25 }] as any

    const result = transformInjectCSS(code, importer)

    const expected = '<div v-bind="someValue"></div>'
    expect(result).toBe(expected)
  })
})
