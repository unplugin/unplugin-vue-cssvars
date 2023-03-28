import { describe, expect, test } from 'vitest'
import { parse as babelParse } from '@babel/parser'
import {
  getObjectExpressionReturnNode,
  getVariable,
  getVariableNameByScript,
  getVariableNameBySetup,
  setScriptContent,
} from '../parser-variable'
describe('get variable name', () => {
  test('getObjectExpressionReturnNode', () => {
    const mockNode = {
      properties: [
        {
          key: {
            name: 'foo',
          },
          value: 'foo-value',
        },
      ],
    }
    const res = getObjectExpressionReturnNode(mockNode as any)
    expect(res).toMatchObject({
      foo: 'foo-value',
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
        type: 'StringLiteral',
        value: 'red',
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
        type: 'StringLiteral',
        value: 'red',
      },
    })
  })

  test('getVariableNameByScript: content is empty', () => {
    const res = getVariableNameByScript('', {})
    expect(res).toMatchObject({})
  })

  // <script>const foo = 'foo' </script>
  // <script>const bar = 'bar' </script>
  test('getVariableNameByScript: no data and setup methods and no setup script', () => {
    const mockDescriptor = {
      scriptSetup: null,
      script: { content: 'const bar = \'bar\'' },
    } as any
    const content = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(content, {})
    expect(res).toMatchObject({})
  })

  // <script setup> const foo = 'foo'; const bar = 'bar' </script>
  // <script>const bar = 'foo'; const head = 'head' </script>
  test('getVariableNameByScript: no data and setup methods and have setup script', () => {
    const mockDescriptor = {
      scriptSetup: { content: 'const foo = \'foo\'; const bar = \'bar\'' },
      script: { content: 'const bar = \'foo\'; const head = \'head\'' },
    } as any
    const contentSetup = setScriptContent(mockDescriptor, 'setup')
    const variableName = getVariableNameBySetup(contentSetup)

    const contentScript = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(contentScript, variableName)

    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'foo',
      },
      bar: {
        type: 'StringLiteral',
        value: 'bar',
      },
      head: {
        type: 'StringLiteral',
        value: 'head',
      },
    })
  })

  // <script>
  // export default {
  // data(){
  //    return {
  //      foo: 'data-foo',
  //    }
  //  }
  // }
  // </script>
  test('getVariableNameByScript: data method', () => {
    const mockDescriptor = {
      scriptSetup: null,
      script: {
        content: 'export default {\n'
            + 'data(){\n'
            + '   return {\n'
            + '     foo: \'foo\',\n'
            + '   }\n'
            + ' }\n'
            + '}',
      },
    } as any
    const contentSetup = setScriptContent(mockDescriptor, 'setup')
    const variableName = getVariableNameBySetup(contentSetup)

    const contentScript = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(contentScript, variableName)

    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'foo',
      },
    })
  })

  // <script setup> const foo = 'foo'; const bar = 'bar' </script>
  // <script>
  // export default {
  // data(){
  //    return {
  //      foo: 'data-foo',
  //    }
  //  }
  // }
  // </script>
  test('getVariableNameByScript: data method and setup script', () => {
    const mockDescriptor = {
      scriptSetup: { content: 'const foo = \'foo\'; const bar = \'bar\' ' },
      script: {
        content: 'export default {\n'
            + 'data(){\n'
            + '   return {\n'
            + '     foo: \'data-foo\',\n'
            + '   }\n'
            + ' }\n'
            + '}',
      },
    } as any
    const contentSetup = setScriptContent(mockDescriptor, 'setup')
    const variableName = getVariableNameBySetup(contentSetup)

    const contentScript = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(contentScript, variableName)

    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'foo',
      },
      bar: {
        type: 'StringLiteral',
        value: 'bar',
      },
    })
  })

  // <script setup> const foo = 'foo'; const bar = 'bar' </script>
  // <script>
  // export default {
  // setup(){
  //    return {
  //      foo: 'setup-foo',
  //    }
  //  }
  // }
  // </script>
  test('getVariableNameByScript: setup method and setup script', () => {
    const mockDescriptor = {
      scriptSetup: { content: 'const foo = \'foo\'; const bar = \'bar\' ' },
      script: {
        content: 'export default {\n'
            + 'setup(){\n'
            + '   return {\n'
            + '     foo: \'setup-foo\',\n'
            + '   }\n'
            + ' }\n'
            + '}',
      },
    } as any
    const contentSetup = setScriptContent(mockDescriptor, 'setup')
    const variableName = getVariableNameBySetup(contentSetup)

    const contentScript = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(contentScript, variableName)

    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'foo',
      },
      bar: {
        type: 'StringLiteral',
        value: 'bar',
      },
    })
  })

  // <script>
  // export default {
  // data(){
  //    return {
  //      foo: 'data-foo',
  //    }
  //  },
  //  setup(){
  //    return {
  //      foo: 'setup-foo',
  //    }
  //  }
  // }
  // </script>
  test('getVariableNameByScript: data method and setup method', () => {
    const mockDescriptor = {
      scriptSetup: null,
      script: {
        content: 'export default {\n'
            + 'data(){\n'
            + '   return {\n'
            + '     foo: \'data-foo\',\n'
            + '   }\n'
            + ' },\n'
            + ' setup(){\n'
            + '   return {\n'
            + '     foo: \'setup-foo\',\n'
            + '   }\n'
            + ' }\n'
            + '}',
      },
    } as any
    const contentSetup = setScriptContent(mockDescriptor, 'setup')
    const variableName = getVariableNameBySetup(contentSetup)

    const contentScript = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(contentScript, variableName)
    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'setup-foo',
      },
    })
  })

  // <script>
  // export default {
  // setup(){
  //    return {
  //      foo: 'setup-foo',
  //    }
  //  },
  //  data(){
  //    return {
  //      foo: 'data-foo',
  //    }
  //  }
  // }
  // </script>
  test('getVariableNameByScript: setup method and data method', () => {
    const mockDescriptor = {
      scriptSetup: null,
      script: {
        content: 'export default {\n'
            + 'setup(){\n'
            + '   return {\n'
            + '     foo: \'setup-foo\',\n'
            + '   }\n'
            + ' },\n'
            + ' data(){\n'
            + '   return {\n'
            + '     foo: \'data-foo\',\n'
            + '   }\n'
            + ' }\n'
            + '}',
      },
    } as any
    const contentSetup = setScriptContent(mockDescriptor, 'setup')
    const variableName = getVariableNameBySetup(contentSetup)

    const contentScript = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(contentScript, variableName)
    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'data-foo',
      },
    })
  })

  // <script setup>
  // const foo = 'foo'; const bar = 'bar'; const setupScript = 'setupScript'
  // </script>

  // <script>
  // export default {
  // setup(){
  //    return {
  //      foo: 'setup-foo',
  //      setupFoo: 'setup-foo',
  //    }
  //  },
  //  data(){
  //    return {
  //      foo: 'data-foo',
  //      dataFoo: 'data-foo',
  //    }
  //  }
  // }
  // </script>
  test('getVariableNameByScript: setup method and data method and setup script', () => {
    const mockDescriptor = {
      scriptSetup: {
        content: 'const foo = \'foo\'; const bar = \'bar\'; const setupScript = \'setupScript\'',
      },
      script: {
        content: 'export default {\n'
            + 'setup(){\n'
            + '   return {\n'
            + '     foo: \'setup-foo\',\n'
            + '     setupFoo: \'setup-foo\',\n'
            + '   }\n'
            + ' },\n'
            + ' data(){\n'
            + '   return {\n'
            + '     foo: \'data-foo\',\n'
            + '     dataFoo: \'data-foo\',\n'
            + '   }\n'
            + ' }\n'
            + '}',
      },
    } as any
    const contentSetup = setScriptContent(mockDescriptor, 'setup')
    const variableName = getVariableNameBySetup(contentSetup)

    const contentScript = setScriptContent(mockDescriptor, 'script')
    const res = getVariableNameByScript(contentScript, variableName)

    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'foo',
      },
      bar: {
        type: 'StringLiteral',
        value: 'bar',
      },
      setupScript: {
        type: 'StringLiteral',
        value: 'setupScript',
      },
      dataFoo: {
        type: 'StringLiteral',
        value: 'data-foo',
      },
      setupFoo: {
        type: 'StringLiteral',
        value: 'setup-foo',
      },
    })
  })

  test('getVariable: basic', () => {
    const mockDescriptor = {
      scriptSetup: null,
      script: {
        content: 'export default {\n'
          + 'data(){\n'
          + '   return {\n'
          + '     foo: \'data-foo\',\n'
          + '   }\n'
          + ' },\n'
          + ' setup(){\n'
          + '   return {\n'
          + '     foo: \'setup-foo\',\n'
          + '   }\n'
          + ' }\n'
          + '}',
      },
    } as any
    const res = getVariable(mockDescriptor)
    expect(res).toMatchObject({
      foo: {
        type: 'StringLiteral',
        value: 'setup-foo',
      },
    })
  })
})
