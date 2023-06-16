import { beforeEach, describe, expect, test } from 'vitest'
import { parse } from '@babel/parser'
import {
  getVar,
  parseHasCSSVars,
  parseSetupBody,
  parseUseCSSVars,
  parserCompiledSfc,
  resetVar,
  setVar,
} from '../parser-compiled-sfc'
import type { CallExpression, Identifier, ImportSpecifier, ObjectExpression } from '@babel/types'
describe('parseSetupBody', () => {
  let node: any

  beforeEach(() => {
    node = {}
    resetVar()
  })

  test('should set isSetupEnter to true when node is an Identifier with name "setup"', () => {
    node.type = 'Identifier'
    node.name = 'setup'

    parseSetupBody(node)

    expect(getVar().isSetupEnter).toBe(true)
  })

  test('should set setupBodyNode to node when isSetupEnter is true and node is a BlockStatement', () => {
    setVar('isSetupEnter', true)
    node.type = 'BlockStatement'

    parseSetupBody(node)

    expect(getVar().isSetupEnter).toBe(false)
    expect(getVar().setupBodyNode).toBe(node)
  })

  test('should do nothing when node is not an Identifier with name "setup" and isSetupEnter is false', () => {
    node.type = 'BlockStatement'

    parseSetupBody(node)

    expect(getVar().isSetupEnter).toBe(false)
    expect(getVar().setupBodyNode).toEqual({})
  })

  test('should do nothing when node is not a BlockStatement and isSetupEnter is true', () => {
    setVar('isSetupEnter', true)
    node.type = 'Identifier'
    node.name = 'not-setup'

    parseSetupBody(node)

    expect(getVar().isSetupEnter).toBe(true)
    expect(getVar().setupBodyNode).toEqual({})
  })
})

describe('parseHasCSSVars', () => {
  beforeEach(() => {
    // reset the state of `hasCSSVars` to `false` after each test
    resetVar()
  })

  test('should set `hasCSSVars` to `true` if node type is Identifier with name "useCssVars" and has a parent ImportSpecifier', () => {
    const code = 'import { useCssVars } from \'vue\''
    const ast = parse(code, { sourceType: 'module' })

    // the node representing the `useCssVars` identifier
    const node = (ast.program.body[0] as any).specifiers[0].local
    const parent = (ast.program.body[0] as any).specifiers[0] as ImportSpecifier

    parseHasCSSVars(node, parent)

    expect(getVar().hasCSSVars).toBe(true)
  })

  test('should not set `hasCSSVars` to `true` if node type is not Identifier with name "useCssVars"', () => {
    const code = 'const a = 1'
    const ast = parse(code)

    const node = (ast as any).program.body[0].declarations[0].init

    parseHasCSSVars(node, null!)

    expect(getVar().hasCSSVars).toBe(false)
  })

  test('should not set `hasCSSVars` to `true` if node has no parent ImportSpecifier', () => {
    const code = 'import useCssVars from \'vue\''
    const ast = parse(code, { sourceType: 'module' })

    const node = (ast.program.body[0] as any).specifiers[0].local

    parseHasCSSVars(node, null!)

    expect(getVar().hasCSSVars).toBe(false)
  })
})

describe('parseUseCSSVars function', () => {
  let node: Node & { scopeIds?: Set<string> } & Identifier & CallExpression & ObjectExpression
  let parent: Node & { scopeIds?: Set<string> } & Identifier & CallExpression & ObjectExpression

  beforeEach(() => {
    resetVar()
    node = {} as Node & { scopeIds?: Set<string> } & Identifier & CallExpression & ObjectExpression
    parent = {} as Node & { scopeIds?: Set<string> } & Identifier & CallExpression & ObjectExpression
  })

  test('sets isUseCSSVarsEnter to true when called with _useCssVars identifier and a CallExpression parent', () => {
    (node as Identifier).type = 'Identifier';
    (node as Identifier).name = '_useCssVars';
    (parent as CallExpression).type = 'CallExpression'

    parseUseCSSVars(node as any, parent as any)

    expect(getVar().isUseCSSVarsEnter).toBe(true)
  })

  test('does not set isUseCSSVarsEnter to true when called with non-_useCssVars identifier and a CallExpression parent', () => {
    (node as Identifier).type = 'Identifier';
    (node as Identifier).name = 'foo';
    (parent as CallExpression).type = 'CallExpression'

    parseUseCSSVars(node, parent as any)

    expect(getVar().isUseCSSVarsEnter).toBe(false)
  })

  test('does not set isUseCSSVarsEnter to true when called with _useCssVars identifier and a non-CallExpression parent', () => {
    (node as Identifier).type = 'Identifier';
    (node as Identifier).name = '_useCssVars';
    (parent as Identifier).type = 'Identifier'

    parseUseCSSVars(node, parent as any)

    expect(getVar().isUseCSSVarsEnter).toBe(false)
  })

  test('does not set isUseCSSVarsEnter to true when called with _useCssVars identifier and no parent', () => {
    (node as Identifier).type = 'Identifier';
    (node as any).name = '_useCssVars'

    parseUseCSSVars(node, undefined!)

    expect(getVar().isUseCSSVarsEnter).toBe(false)
  })

  test('sets useCSSVarsNode to the node when isUseCSSVarsEnter is true and node is an ObjectExpression', () => {
    setVar('isUseCSSVarsEnter', true);
    (node as ObjectExpression).type = 'ObjectExpression'
    parseUseCSSVars(node, parent as any)

    expect(getVar().useCSSVarsNode).toBe(node)
  })

  test('does not set useCSSVarsNode when isUseCSSVarsEnter is true and node is not an ObjectExpression', () => {
    setVar('isUseCSSVarsEnter', true);
    (node as Identifier).type = 'Identifier'

    parseUseCSSVars(node, parent as any)

    expect(getVar().useCSSVarsNode).not.toBe(node)
  })

  test('does not set useCSSVarsNode when isUseCSSVarsEnter is false and node is an ObjectExpression', () => {
    setVar('isUseCSSVarsEnter', false);
    (node as ObjectExpression).type = 'ObjectExpression'

    parseUseCSSVars(node, parent as any)

    expect(getVar().useCSSVarsNode).not.toBe(node)
  })
})

describe('parserCompiledSfc', () => {
  test('should parse setupBodyNode when an Identifier named setup is encountered', () => {
    const code = `
    const comp = {
      setup() {}
      }
    `
    const res = parserCompiledSfc(code)
    expect(res.setupBodyNode.type).toBe('BlockStatement')
  })

  test('should parse hasCSSVars when an Identifier named useCssVars is encountered with a parent ImportSpecifier', () => {
    const code = `
      import { useCssVars } from 'vue';
      useCssVars();
    `
    const res = parserCompiledSfc(code)
    expect(res.hasCSSVars).toBe(true)
  })

  test('should parse useCSSVarsNode when an Identifier named _useCssVars is encountered with a parent CallExpression and an ObjectExpression node is encountered afterwards', () => {
    const code = `
    import {useCssVars as _useCssVars} from "vue"
    const comp = {
      setup() {
          _useCssVars((_ctx)=>({
            "1439c43b": color.value,

          }));
        }
      }
    `
    const res = parserCompiledSfc(code)
    expect(res.useCSSVarsNode.type).toBe('ObjectExpression')
  })

  test('should not parse setupBodyNode, hasCSSVars or useCSSVarsNode when there are no matches', () => {
    const code = `
      const a = 1;
      const b = 2;
      const c = a + b;
    `
    const res = parserCompiledSfc(code)
    expect(res.setupBodyNode).toEqual({})
    expect(res.hasCSSVars).toBe(false)
    expect(res.useCSSVarsNode).toEqual({})
  })
})
