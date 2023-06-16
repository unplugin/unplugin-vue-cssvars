import { describe, expect, test } from 'vitest'
import { parseCssVars } from '../parser-vbind-m'

describe('analyze css vbind', () => {
  test('Should be able to parse to extract the v-bind-m value', () => {
    const source = `
    .test {
      color: v-bind-m(color);
    }
  `
    const expected = ['color']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse single quoted values', () => {
    const source = `
    .test {
      color: v-bind-m('color');
    }
  `
    const expected = ['color']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse double quoted values', () => {
    const source = `
    .test {
      color: v-bind-m("color");
    }
  `
    const expected = ['color']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse the value of the template string', () => {
    const source = `
    .test {
      color: v-bind-m(\`\${v}\`);
      background-image: v-bind-m('\`url('\${bgUrl}')\`');
    }
  `

    const expected = ['`${v}`', '`url(\'${bgUrl}\')`']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse extract v-bind-m values in nested', () => {
    const source = `
    .parent {
      .child {
        color: v-bind-m(color);
      }
    }
  `
    const expected = ['color']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse extract v-bind-m values when ignoring single line comments', () => {
    const source = `
    .test {
      color: v-bind-m(color); // this is a comment
    }
  `
    const expected = ['color']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse extract v-bind-m values when ignoring multi-line comments', () => {
    const source = `
    .test {
      color: v-bind-m(color); /* this is a
      multi-line
      comment */
    }
  `
    const expected = ['color']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to extract multiple v-bind-m values in analysis', () => {
    const source = `
    .test {
      color: v-bind-m(color1);
      background-color: v-bind-m(color2);
    }
  `
    const expected = ['color1', 'color2']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should only analyze to extract unique values', () => {
    const source = `
    .test {
      color: v-bind-m(color1);
      background-color: v-bind-m(color1);
    }
  `
    const expected = ['color1']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse to extract values inside nested parentheses', () => {
    const source = `
    .test {
      color: v-bind-m(((color1)));
    }
  `
    const expected = ['((color1))']
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('Should be able to parse to extract values template string', () => {
    const source = '.test{ color: v-bind-m(`${v}`);\n     background-image: v-bind-m(\"`url(\'${bgUrl}\')`\");}'
    const expected = ["`${v}`","`url('${bgUrl}')`"]
    expect(parseCssVars([source])).toMatchObject(expected)
  })

  test('the right parenthesis is missing', () => {
    const source = `
    .test {
      v-bind-m(color1;
    }
  `
    expect(parseCssVars([source])).toMatchObject([])
  })

  test('the left parenthesis is missing', () => {
    const source = `
    .test {
      v-bind-m color1);
    }
  `
    expect(parseCssVars([source])).toMatchObject([])
  })

  test('should be able to parse incomplete expressions', () => {
    const source = `
    .test {
       font-weight: v-bind-m("count.toString(");
       font-weight: v-bind-m(xxx);
    }
  `
    expect(parseCssVars([source])).toMatchObject(['count.toString(', 'xxx'])
  })
})
