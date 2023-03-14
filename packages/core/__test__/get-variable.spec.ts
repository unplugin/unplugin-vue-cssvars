import { describe, expect, test } from 'vitest'
import { parse as babelParse } from '@babel/parser'
import {
  getObjectExpressionReturnNode, getVariableNameBySetup,
  setScriptContent,
} from '../get-variable'
describe('get variable name', () => {
  test('getObjectExpressionReturnNode', () => {
    const mockNode = {
      properties: [
        {
          key: {
            name: 'foo',
          },
        },
      ],
    }
    const res = getObjectExpressionReturnNode(mockNode as any)
    expect(res).toMatchObject({
      foo: {
        name: 'foo',
      },
    })
  })

  test('setScriptContent', () => {
    const mockDescriptor = {
      scriptSetup: null,
      script: null,
    } as any
    let content = setScriptContent(mockDescriptor, 'setup')
    expect(content).toBe('')

    content = setScriptContent(mockDescriptor, 'script')
    expect(content).toBe('')

    mockDescriptor.scriptSetup = {
      content: 'foo',
    }
    content = setScriptContent(mockDescriptor, 'setup')
    expect(content).toBe('foo')
    content = setScriptContent(mockDescriptor, 'script')
    expect(content).toBe('')

    mockDescriptor.script = {
      content: 'foo',
    }
    content = setScriptContent(mockDescriptor, 'setup')
    expect(content).toBe('foo')
    content = setScriptContent(mockDescriptor, 'script')
    expect(content).toBe('foo')
  })

  test('getVariableNameBySetup: invalid parameter', () => {
    const res = getVariableNameBySetup('')
    expect(res).toMatchObject({})
  })

  test('getVariableNameBySetup: basic', () => {
    const mockContent = 'const color = "red"'
    const res = getVariableNameBySetup(mockContent)
    expect(res).toMatchObject({
      color: {
        type: 'Identifier',
        name: 'color',
      },
    })
  })

  test('getVariableNameBySetup: skip parse', () => {
    const mockContent = 'const color = "red"'
    const ast = babelParse(mockContent, {
      sourceType: 'module',
      plugins: ['typescript'],
    })
    const res = getVariableNameBySetup('', ast)
    expect(res).toMatchObject({
      color: {
        type: 'Identifier',
        name: 'color',
      },
    })
  })
})
