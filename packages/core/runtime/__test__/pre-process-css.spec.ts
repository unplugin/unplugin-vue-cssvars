import { resolve } from 'path'
import { describe, expect, test } from 'vitest'
import { normalizePath } from 'baiwusanyu-utils'
import { getAllCSSFilePath, preProcessCSS } from '../pre-process-css'

describe('pre process css', () => {
  test('preProcessCSS: basic', () => {
    const res = preProcessCSS(
      {
        rootDir: resolve('packages'),
        includeCompile: ['**/**.css'],
      },
    )
    const mockPathTest1 = normalizePath(`${resolve()}/core/runtime/__test__/style/test.css`)
    const mockPathTest2 = normalizePath(`${resolve()}/core/runtime/__test__/style/test2.css`)
    const resTest1 = res.get(mockPathTest1)
    const resTest2 = res.get(mockPathTest2)
    expect(resTest1).toBeTruthy()
    expect([...resTest1!.importer][0]).toBe(mockPathTest2)
    expect(resTest1!.vBindCode).toMatchObject(['color'])
    expect(resTest1!.vBindCode).toMatchSnapshot()

    expect(resTest2).toBeTruthy()
    expect(resTest2!.importer.size).toBe(1)
    expect(resTest2!.vBindCode).toMatchObject(['appTheme2'])
    expect(resTest2!.vBindCode).toMatchSnapshot()
  })

  test('preProcessCSS: map path scss -> css or scss', () => {
    const res = preProcessCSS(
      {
        rootDir: resolve('packages'),
        includeCompile: ['**/**.css', '**/**.scss'],
      },
    )
    const mockPathFooSCSS = normalizePath(`${resolve()}/core/runtime/__test__/style/foo.scss`)
    const mockPathTestSCSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test.scss`)
    const mockPathTest2CSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.scss -> test.css or test.scss ? -> test.scss
    const importerFooSCSS = res.get(mockPathFooSCSS)
    expect([...importerFooSCSS!.importer][0]).toBe(mockPathTestSCSS)
    // foo.scss -> test.css or test.scss ? -> test.scss -> test2.css
    const importerTestSCSS = res.get(mockPathTestSCSS)
    expect([...importerTestSCSS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.scss -> test2.css
    const mockPathFoo2SCSS = normalizePath(`${resolve()}/core/runtime/__test__/style/foo2.scss`)
    const mockPathTestCSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2SCSS = res.get(mockPathFoo2SCSS)
    expect([...importerFoo2SCSS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.scss ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path less -> css or less', () => {
    const res = preProcessCSS(
      {
        rootDir: resolve('packages'),
        includeCompile: ['**/**.css', '**/**.less'],
      },
    )
    const mockPathFooLESS = normalizePath(`${resolve()}/core/runtime/__test__/style/foo.less`)
    const mockPathTestLESS = normalizePath(`${resolve()}/core/runtime/__test__/style/test.less`)
    const mockPathTest2CSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.less -> test.css or test.less ? -> test.less
    const importerFooLESS = res.get(mockPathFooLESS)
    expect([...importerFooLESS!.importer][0]).toBe(mockPathTestLESS)
    // foo.less -> test.css or test.less ? -> test.less -> test2.css
    const importerTestLESS = res.get(mockPathTestLESS)
    expect([...importerTestLESS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.less -> test2.css
    const mockPathFoo2LESS = normalizePath(`${resolve()}/core/runtime/__test__/style/foo2.less`)
    const mockPathTestCSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2LESS = res.get(mockPathFoo2LESS)
    expect([...importerFoo2LESS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.less ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path styl -> css or styl', () => {
    const res = preProcessCSS(
      {
        rootDir: resolve('packages'),
        includeCompile: ['**/**.css', '**/**.styl'],
      },
    )
    const mockPathFooSTYL = normalizePath(`${resolve()}/core/runtime/__test__/style/foo.styl`)
    const mockPathTestSTYL = normalizePath(`${resolve()}/core/runtime/__test__/style/test.styl`)
    const mockPathTest2CSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.styl -> test.css or test.styl ? -> test.styl
    const importerFooSTYL = res.get(mockPathFooSTYL)
    expect([...importerFooSTYL!.importer][0]).toBe(mockPathTestSTYL)
    // foo.styl -> test.css or test.styl ? -> test.styl -> test2.css
    const importerTestSTYL = res.get(mockPathTestSTYL)
    expect([...importerTestSTYL!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.styl -> test2.css
    const mockPathFoo2STYL = normalizePath(`${resolve()}/core/runtime/__test__/style/foo2.styl`)
    const mockPathTestCSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2STYL = res.get(mockPathFoo2STYL)
    expect([...importerFoo2STYL!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.styl ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: map path sass -> css or sass', () => {
    const res = preProcessCSS({
      rootDir: resolve('packages'),
      includeCompile: ['**/**.css', '**/**.sass'],
    })
    const mockPathFooSASS = normalizePath(`${resolve()}/core/runtime/__test__/style/foo.sass`)
    const mockPathTestSASS = normalizePath(`${resolve()}/core/runtime/__test__/style/test.sass`)
    const mockPathTest2CSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test2.css`)
    // foo.sass -> test.css or test.sass ? -> test.sass
    const importerFooSASS = res.get(mockPathFooSASS)
    expect([...importerFooSASS!.importer][0]).toBe(mockPathTestSASS)
    // foo.sass -> test.css or test.sass ? -> test.sass -> test2.css
    const importerTestSASS = res.get(mockPathTestSASS)
    expect([...importerTestSASS!.importer][0]).toBe(mockPathTest2CSS)

    // foo2.sass -> test2.css
    const mockPathFoo2SASS = normalizePath(`${resolve()}/core/runtime/__test__/style/foo2.sass`)
    const mockPathTestCSS = normalizePath(`${resolve()}/core/runtime/__test__/style/test.css`)
    const importerFoo2SASS = res.get(mockPathFoo2SASS)
    expect([...importerFoo2SASS!.importer][0]).toBe(mockPathTest2CSS)
    // test2.css -> test.css or test.sass ? -> test.css
    const importerTest2CSS = res.get(mockPathTest2CSS)
    expect([...importerTest2CSS!.importer][0]).toBe(mockPathTestCSS)
  })

  test('preProcessCSS: basic', () => {
    const files = getAllCSSFilePath(['**/**.css'], resolve('packages'))
    expect(files).toMatchObject([
      'core/hmr/__test__/style/foo.css',
      'core/runtime/__test__/style/foo.css',
      'core/runtime/__test__/style/test.css',
      'core/runtime/__test__/style/test2.css',
    ])
    expect(files).toMatchSnapshot()
  })
})
