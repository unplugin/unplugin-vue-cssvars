import { resolve } from 'path'
import { describe, expect, test } from 'vitest'
import { DEFAULT_EXCLUDE_REG, DEFAULT_INCLUDE_REG } from '@unplugin-vue-cssvars/utils'
import { initOption } from '../index'
describe('option', () => {
  test('create option', () => {
    const mockOption = {
    }
    const res = initOption(mockOption)
    expect(res).toMatchObject({
      rootDir: resolve(),
      include: DEFAULT_INCLUDE_REG,
      exclude: DEFAULT_EXCLUDE_REG,
    })
  })

  test('default option', () => {
    const res = initOption({})
    expect(res).toMatchObject({
      rootDir: resolve(),
      include: DEFAULT_INCLUDE_REG,
      exclude: DEFAULT_EXCLUDE_REG,
    })
  })
})
