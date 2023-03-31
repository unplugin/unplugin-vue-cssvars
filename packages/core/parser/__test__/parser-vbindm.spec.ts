
import { describe, expect, test } from 'vitest'
import { parseVBindM } from '../parser-vbindm'

describe('parse vbindm', () => {
  test('test1', () => {
    const source = `
    .test {
      color: v-bind-m(color);
    }
  `
    const expected = ['color']
    expect(parseVBindM(source)).toMatchObject(expected)
  })

  test('test2', () => {
    const source = `
    .parent {
      .child {
        color: v-bind-m(color);
      }
    }
  `
    const expected = ['color']
    expect(parseVBindM(source)).toMatchObject(expected)
  })

  test('test3', () => {
    const source = `
    .test {
      color: v-bind-m(color); // this is a comment
    }
  `
    const expected = ['color']
    expect(parseVBindM(source)).toMatchObject(expected)
  })

  test('test4', () => {
    const source = `
    .test {
      color: v-bind-m(color); /* this is a
      multi-line
      comment */
    }
  `
    const expected = ['color']
    expect(parseVBindM(source)).toMatchObject(expected)
  })

  test('test5', () => {
    const source = `
    .test {
      color: v-bind-m(color1);
      background-color: v-bind-m(color2);
    }
  `
    const expected = ['color1', 'color2']
    expect(parseVBindM(source)).toMatchObject(expected)
  })

  test('test6', () => {
    const source = `
    .test {
      color: v-bind-m(((color1)));
    }
  `
    const expected = ['color1']
    expect(parseVBindM(source)).toMatchObject(expected)
  })

  test('test7', () => {
    const source = `
    .test {
      v-bind-m(color1;
    }
  `
    expect(() => parseVBindM(source)).toThrow('syntax error: unmatched )')
  })

  test('test8', () => {
    const source = `
    .test {
      v-bind-m color1);
    }
  `
    expect(() => parseVBindM(source)).toThrow('syntax error: unmatched (')
  })
})
