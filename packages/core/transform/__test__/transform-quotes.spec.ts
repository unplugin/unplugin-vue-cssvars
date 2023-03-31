import { describe, expect, test } from 'vitest'
import { transformQuotes } from '../transform-quotes'

describe('transformQuotes', () => {
  test('basic', () => {
    const testCases = [
      { input: 'hello', expected: '"hello"' },
      { input: '"hello"', expected: '"hello"' },
      { input: "'world'", expected: '"world"' },
    ]
    testCases.forEach(({ input, expected }) => {
      const result = transformQuotes({ path: input } as any)
      expect(result.path).toBe(expected)
    })
  })
})
