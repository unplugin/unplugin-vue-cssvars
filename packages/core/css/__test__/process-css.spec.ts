import { describe, expect, test, vi } from 'vitest'
import { getCSSFileRecursion } from '../process-css'
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
})
