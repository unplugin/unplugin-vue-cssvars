import { beforeEach, describe, expect, test } from 'vitest'
import { injectCSSVars } from '../inject-cssvars'
describe('inject cssvars', () => {
  const mockCode = '<style>.foo{ color: red }</style>'
  const vBindValue = new Set()
  vBindValue.add('\\n/* created by @unplugin-vue-cssvars */\\n/* <inject start> */\\n.foo{color:v-bind(color)}\\n/* <inject end> */\\n')
  let mockCSSModule = [] as any
  const mockVariableName = {
    color: ' ',
  }
  let expectContent = ''
  beforeEach(() => {
    mockCSSModule = [
      {
        vBindCode: {
          color: vBindValue,
        },
      },
    ]
    expectContent = `${mockCode}\n<style scoped>${[...mockCSSModule[0].vBindCode.color]}\n</style>`
  })

  test('injectCSSVars: basic', () => {
    const res = injectCSSVars(mockCode, mockCSSModule as any, mockVariableName as any)
    expect(res).toBe(expectContent)
    expect(res).matchSnapshot()
  })

  test('injectCSSVars: vBindCode is null', () => {
    mockCSSModule[0].vBindCode = null
    const res = injectCSSVars(mockCode, mockCSSModule as any, mockVariableName as any)
    expect(res).toBe(mockCode)
    expect(res).matchSnapshot()
  })

  test('injectCSSVars: unmatched key', () => {
    const res = injectCSSVars(mockCode, mockCSSModule as any, { foo: '' } as any)
    expect(res).toBe(mockCode)
    expect(res).matchSnapshot()
  })

  test('injectCSSVars: multiple value', () => {
    vBindValue.add('\\n/* created by @unplugin-vue-cssvars */\\n/* <inject start> */\\n.bar{color:v-bind(color)}\\n/* <inject end> */\\n')
    expectContent = `${mockCode}\n<style scoped>${[...mockCSSModule[0].vBindCode.color].join('')}\n</style>`
    const res = injectCSSVars(mockCode, mockCSSModule as any, mockVariableName as any)
    expect(res).toBe(expectContent)
    expect(res).matchSnapshot()
  })
})
