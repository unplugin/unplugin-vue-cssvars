import { describe, expect, test, vi } from 'vitest'
import { createCSSModule, getCSSFileRecursion } from '../process-css'
import type { ICSSFile } from '../../types'
describe('process css', () => {
  test('getCSSFileRecursion: basic', () => {
    const mockEvt = vi.fn()
    const mockRes: Array<ICSSFile> = []
    const mockCssFiles = new Map()
    mockCssFiles.set('foo', {
      importer: new Set(),
      vBindCode: {
        foo: new Set(['v-bind(foo)']),
      },
    })
    getCSSFileRecursion('foo', mockCssFiles, (v) => {
      mockEvt()
      mockRes.push(v)
    })
    expect(mockRes.length).toBe(1)
    expect(mockEvt).toBeCalledTimes(1)
    expect(mockRes[0].vBindCode).toMatchObject({
      foo: new Set(['v-bind(foo)']),
    })
  })

  test('getCSSFileRecursion: unmatched key', () => {
    const mockEvt = vi.fn()
    const mockRes = []
    const mockCssFiles = new Map()
    mockCssFiles.set('foo', {
      importer: new Set(['foo1', 'foo2']),
    })
    getCSSFileRecursion('bar', mockCssFiles, (v) => {
      mockEvt()
      mockRes.push(v)
    })
    expect(mockRes.length).toBe(0)
    expect(mockEvt).not.toBeCalled()
  })

  test('getCSSFileRecursion: recursion', () => {
    const mockEvt = vi.fn()
    const mockRes: Array<ICSSFile> = []
    const mockCssFiles = new Map()
    mockCssFiles.set('foo', {
      importer: new Set(['bar']),
      vBindCode: {
        foo: new Set(['v-bind(foo)']),
      },
    })
    mockCssFiles.set('bar', {
      importer: new Set(),
      vBindCode: {
        bar: new Set(['v-bind(bar)']),
      },
    })
    getCSSFileRecursion('foo', mockCssFiles, (v) => {
      mockEvt()
      mockRes.push(v)
    })
    expect(mockRes.length).toBe(2)
    expect(mockEvt).toBeCalledTimes(2)
    expect(mockRes[0].vBindCode).toMatchObject({
      foo: new Set(['v-bind(foo)']),
    })
    expect(mockRes[1].vBindCode).toMatchObject({
      bar: new Set(['v-bind(bar)']),
    })
  })

  test('getCSSFileRecursion: circular dependencies', () => {
    const mockEvt = vi.fn()
    const mockRes: Array<ICSSFile> = []
    const mockCssFiles = new Map()
    mockCssFiles.set('foo', {
      importer: new Set(['bar']),
      vBindCode: {
        foo: new Set(['v-bind(foo)']),
      },
    })
    mockCssFiles.set('bar', {
      importer: new Set(['foo']),
      vBindCode: {
        bar: new Set(['v-bind(bar)']),
      },
    })
    getCSSFileRecursion('foo', mockCssFiles, (v) => {
      mockEvt()
      mockRes.push(v)
    })
    expect(mockRes.length).toBe(2)
    expect(mockEvt).toBeCalledTimes(2)
    expect(mockRes[0].vBindCode).toMatchObject({
      foo: new Set(['v-bind(foo)']),
    })
    expect(mockRes[1].vBindCode).toMatchObject({
      bar: new Set(['v-bind(bar)']),
    })
  })

  test('createCSSModule: basic', () => {
    const mockCssFiles = new Map()
    const mockCSSFilesContent = {
      importer: new Set(),
      vBindCode: {
        foo: new Set(['v-bind(foo)']),
      },
    }
    mockCssFiles.set('D:\\project-github\\unplugin-vue-cssvars\\play\\src\\assets\\test.css', mockCSSFilesContent)
    const mockDescriptor = {
      styles: [{
        content: '@import "./assets/test";\n'
          + ' div {\n'
          + '   color: v-bind(color2)\n'
          + ' }',
      }],
    }
    const mockId = 'D:/project-github/unplugin-vue-cssvars/play/src/App.vue'
    const res = createCSSModule(mockDescriptor as any, mockId, mockCssFiles)
    expect(res).toMatchObject([mockCSSFilesContent])
    expect(res).matchSnapshot()
  })

  test('createCSSModule: multiple style tag', () => {
    const mockCssFiles = new Map()
    const mockCSSFilesContent = {
      importer: new Set(),
      vBindCode: {
        foo: new Set(['v-bind(foo)']),
      },
    }
    mockCssFiles.set('D:\\project-github\\unplugin-vue-cssvars\\play\\src\\assets\\test.css', mockCSSFilesContent)
    const mockCSSFilesContent2 = {
      importer: new Set(),
      vBindCode: {
        bar: new Set(['v-bind(bar)']),
      },
    }
    mockCssFiles.set('D:\\project-github\\unplugin-vue-cssvars\\play\\src\\assets\\test2.css', mockCSSFilesContent2)
    const mockDescriptor = {
      styles: [{
        content: '@import "./assets/test";\n'
          + ' div {\n'
          + '   color: v-bind(color)\n'
          + ' }',
      },
      {
        content: '@import "./assets/test2";\n'
          + ' div {\n'
          + '   color: v-bind(color2)\n'
          + ' }',
      }],
    }
    const mockId = 'D:/project-github/unplugin-vue-cssvars/play/src/App.vue'
    const res = createCSSModule(mockDescriptor as any, mockId, mockCssFiles)
    expect(res).toMatchObject([mockCSSFilesContent, mockCSSFilesContent2])
    expect(res).matchSnapshot()
  })

  test('createCSSModule: no style tag', () => {
    const mockCssFiles = new Map()
    mockCssFiles.set('foo', {
      importer: new Set(),
      vBindCode: {
        foo: new Set(['v-bind(foo)']),
      },
    })
    const mockDescriptor = {
      styles: [],
    }
    const res = createCSSModule(mockDescriptor as any, 'foo', mockCssFiles)
    expect(res.length).toBe(0)
  })
})
