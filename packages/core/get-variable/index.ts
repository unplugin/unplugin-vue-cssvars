import { parse as babelParse } from '@babel/parser'
import { walk } from 'estree-walker'
import { extend, isEmptyObj } from '@unplugin-vue-cssvars/utils'
import type { VariableName } from '../types'
import type { ParseResult } from '@babel/parser'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import type {
  File,
  Identifier,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  ReturnStatement,
  VariableDeclarator,
} from '@babel/types'
import type { Node } from 'estree-walker'
/**
 * 获取变量
 * @param descriptor
 */

export const index = (descriptor: SFCDescriptor) => {
  let variableName = {} as VariableName
  // get variable name form setup script
  variableName = getVariableNameBySetup(setScriptContent(descriptor, 'setup'))
  // get variable name form option api or composition api、ordinary script
  variableName = getVariableNameByScript(setScriptContent(descriptor, 'script'), variableName)

  return variableName
}

export function setScriptContent(descriptor: SFCDescriptor, type: 'setup' | 'script') {
  let content = ''
  // setup script
  if (descriptor.scriptSetup && type === 'setup')
    content = descriptor.scriptSetup.content

  // composition and options
  if (descriptor.script && type === 'script')
    content = descriptor.script.content

  return content
}

export function getVariableNameBySetup(content: string, contextAst?: ParseResult<File>) {
  const variableNameBySetup = {} as VariableName
  if (!content && !contextAst) return variableNameBySetup

  const ast = contextAst || babelParse(content, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  (walk as any)(ast, {
    enter(node: Node & { scopeIds?: Set<string> }, parent: Node | undefined) {
      if (parent && parent.type === 'Program' && node.type === 'VariableDeclaration') {
        const declarations = node.declarations as Array<VariableDeclarator>
        declarations.forEach((declare) => {
          const identifier = declare.id as Identifier
          variableNameBySetup[identifier.name] = declare.init
        })
      }
    },
  })

  return variableNameBySetup
}

// 1. setup script =》 scriptSetup =》取定义变量
// 2. setup composition =》 script =》取 setup 返回
// 3. options =》 script =》 取 data 返回
// 4. 普通的 script  =》 script =》 取定义变量

// l1. 2 与 3 冲突，取最新的那个，即直接替换
// l2. 1 与 2、3 冲突，取 1
// l3. 4 与 2、3 不会共存
// l4. 4 与 1 冲突，取 1
// l5. 4 只能有 1 時，存在
export function getVariableNameByScript(content: string, variableName: VariableName) {
  if (!content) return variableName

  let variableNameInScript = {} as VariableName
  let isEmptyVariableNames = false
  let setupIndex = 0
  let dataIndex = 0
  let hasSetup = false
  let hasData = false
  let setupReturnNode = {}
  let dataReturnNode = {}
  let index = 2
  if (isEmptyObj(variableName))
    isEmptyVariableNames = true

  const ast = babelParse(content, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  (walk as any)(ast, {
    enter(
      node: Node & { scopeIds?: Set<string> },
      parent: Node | undefined | ObjectMethod | ReturnStatement | ObjectExpression) {
      if (parent
        && parent.type === 'ObjectMethod'
        && node.type === 'Identifier'
        && node.name === 'setup') {
        hasSetup = true
        setupIndex = index
        index--
      }
      if (parent
        && parent.type === 'ObjectMethod'
        && node.type === 'Identifier'
        && node.name === 'data') {
        hasData = true
        dataIndex = index
        index--
      }
      if (parent
        && parent.type === 'ReturnStatement'
        && node.type === 'ObjectExpression'
        && hasSetup) {
        hasSetup = false
        setupReturnNode = node
      }

      if (parent
        && parent.type === 'ReturnStatement'
        && node.type === 'ObjectExpression'
        && hasData) {
        hasData = false
        dataReturnNode = node
      }
    },
  })

  // 判断是否存在 2 和 3
  if (setupIndex === 0 && dataIndex === 0) {
    // 不存在 2 && 不存在 3 && variableName 为空（1，不存在），则直接返回 variableName, 对应 l5
    if (isEmptyVariableNames) {
      return variableName
    } else {
      // 不存在 2 && 不存在 3 && variableName 不为空（1存在），则直接调用 getVariableNameBySetup, 对应 4
      variableNameInScript = getVariableNameBySetup('', ast)
    }
    // 便利 variableName 与 4 冲突，取 variableName 对应 l4
    variableNameInScript = extend(variableNameInScript, variableName)

    // return 掉， 对应 l3
    setupReturnNode = {}
    dataReturnNode = {}
    return variableNameInScript
  }

  // 2 存在 取 setup 返回 对应 2
  const setupReturnRes = getObjectExpressionReturnNode(setupReturnNode as ObjectExpression)
  // 3 取 data 返回 对应 3
  const dataReturnRes = getObjectExpressionReturnNode(dataReturnNode as ObjectExpression)
  // 对比 2、3，冲突，取最后出现的 对应 l1
  variableNameInScript = setupIndex > dataIndex
    ? extend(setupReturnRes, dataReturnRes)
    : extend(dataReturnRes, setupReturnRes)
  // 遍历 variableName，2， 3 冲突，取 variableName，对应 l2
  if (!isEmptyVariableNames)
    variableNameInScript = extend(variableNameInScript, variableName)

  return variableNameInScript
}

export function getObjectExpressionReturnNode(node: ObjectExpression) {
  const res = {} as VariableName
  if (!node.properties) return res
  node.properties.forEach((value) => {
    const key = (value as ObjectProperty).key as Identifier
    res[key.name] = (value as ObjectProperty).value
  })
  return res
}
