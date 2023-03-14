import { parse as babelParse } from '@babel/parser'
import { walk } from 'estree-walker'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type { Identifier, VariableDeclarator } from '@babel/types'
import type { Node } from 'estree-walker'

/**
 * 获取变量
 * @param descriptor
 */
export const getVariable = (descriptor: SFCDescriptor) => {
  // ⭐⭐⭐ TODO: options
  // ⭐⭐⭐ TODO: setup composition
  const ast = babelParse(descriptor.scriptSetup.content, {
    sourceType: 'module',
    plugins: ['typescript'],
  })
  const variableName = {} as Record<string, Identifier>
  (walk as any)(ast, {
    enter(node: Node & { scopeIds?: Set<string> }, parent: Node | undefined) {
      if (parent && parent.type === 'Program' && node.type === 'VariableDeclaration') {
        const declarations = node.declarations as Array<VariableDeclarator>
        declarations.forEach((declare) => {
          const identifier = declare.id as Identifier
          variableName[identifier.name] = identifier
        })
      }
    },
  })
  return variableName
}
