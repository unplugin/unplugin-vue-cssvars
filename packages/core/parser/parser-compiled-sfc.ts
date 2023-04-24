import { parse as babelParse } from '@babel/parser'
import { walk } from 'estree-walker-ts'
import type {
  BlockStatement,
  CallExpression, ExpressionStatement,
  Identifier,
  ImportSpecifier,
  ObjectExpression,
} from '@babel/types'
import type { Node } from 'estree-walker-ts'

export interface IParseSFCRes {
  setupBodyNode: BlockStatement
  hasCSSVars: boolean
  useCSSVarsNode: ObjectExpression
}

let isSetupEnter = false
let setupBodyNode = {} as BlockStatement
// TODO: unit test
export function parseSetupBody(node: Node & { scopeIds?: Set<string> }) {
  if ((node as Identifier).type === 'Identifier' && (node as Identifier).name === 'setup') {
    isSetupEnter = true
    return
  }
  if (isSetupEnter && (node as BlockStatement).type === 'BlockStatement') {
    isSetupEnter = false
    setupBodyNode = node as BlockStatement
  }
}

let hasCSSVars = false
// TODO: unit test
export function parseHasCSSVars(
  node: Node & { scopeIds?: Set<string> },
  parent: ImportSpecifier) {
  if ((node as Identifier).type === 'Identifier'
    && (node as Identifier).name === 'useCssVars'
    && parent
    && ((parent.type as ImportSpecifier) === 'ImportSpecifier'))
    hasCSSVars = true
}

let useCSSVarsNode = {} as ExpressionStatement
let isUseCSSVarsEnter = false
export function parseUseCSSVars(
  node: Node & { scopeIds?: Set<string> },
  parent: CallExpression) {
  if ((node as Identifier).type === 'Identifier'
    && (node as Identifier).name === '_useCssVars'
    && parent
    && ((parent.type as CallExpression) === 'CallExpression'))
    isUseCSSVarsEnter = true

  if (isUseCSSVarsEnter && (node as ObjectExpression).type === 'ObjectExpression') {
    isUseCSSVarsEnter = false
    useCSSVarsNode = node as ExpressionStatement
  }
}

// TODO: unit test
export function parserCompiledSfc(code: string) {
  isSetupEnter = false
  setupBodyNode = {} as BlockStatement
  isUseCSSVarsEnter = false
  useCSSVarsNode = {} as ExpressionStatement
  hasCSSVars = false

  const ast = babelParse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  (walk as any)(ast, {
    enter(
      node: Node & { scopeIds?: Set<string> },
      parent: Node | undefined | ObjectExpression | ImportSpecifier | CallExpression) {
      parseSetupBody(node)
      parseHasCSSVars(node, parent as ImportSpecifier)
      parseUseCSSVars(node, parent as CallExpression)
    },
  })
  return {
    setupBodyNode,
    hasCSSVars,
    useCSSVarsNode,
  } as IParseSFCRes
}
