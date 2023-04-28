import { setTArray } from '@unplugin-vue-cssvars/utils'
import { preProcessCSS } from '../runtime/pre-process-css'
import type { ICSSFile, ICSSFileMap, Options } from '../types'
import type { ViteDevServer } from 'vite'

export function viteHMR(
  CSSFileModuleMap: ICSSFileMap,
  userOptions: Options,
  file: string,
  server: ViteDevServer,
) {
  // 获取变化的样式文件的 CSSFileMap上有使用它的
  const sfcModulesPathList = CSSFileModuleMap.get(file)
  if (!(sfcModulesPathList && sfcModulesPathList.sfcPath)) return
  // update CSSModules
  updatedCSSModules(CSSFileModuleMap, userOptions, file)
  // reload sfc Module
  reloadSFCModules(CSSFileModuleMap, userOptions, sfcModulesPathList!, file, server)
}

// TODO: unit test
export function webpackHMR(
  CSSFileModuleMap: ICSSFileMap,
  userOptions: Options,
  file: string,
) {
  updatedCSSModules(CSSFileModuleMap, userOptions, file)
}

/**
 * update CSSModules
 * @param CSSFileModuleMap
 * @param userOptions
 * @param file
 */

export function updatedCSSModules(
  CSSFileModuleMap: ICSSFileMap,
  userOptions: Options,
  file: string) {
  const updatedCSSMS = preProcessCSS(userOptions, userOptions.alias, [file]).get(file)
  const res = {
    ...updatedCSSMS,
    sfcPath: CSSFileModuleMap.get(file).sfcPath,
  }
  CSSFileModuleMap.set(file, res!)
}

/**
 * reloadSFCModules
 * @param CSSFileModuleMap
 * @param userOptions
 * @param sfcModulesPathList
 * @param file
 * @param server
 */
export function reloadSFCModules(
  CSSFileModuleMap: ICSSFileMap,
  userOptions: Options,
  sfcModulesPathList: ICSSFile,
  file: string,
  server: ViteDevServer) {
  if (sfcModulesPathList && sfcModulesPathList.sfcPath) {
    // 变化的样式文件的 CSSFileMap上有使用它的 sfc 的信息
    const ls = setTArray(sfcModulesPathList.sfcPath)
    ls.forEach((sfcp: string) => {
      // update sfc
      const modules = server.moduleGraph.fileToModulesMap.get(sfcp) || new Set()
      const modulesList = setTArray(modules)
      for (let i = 0; i < modulesList.length; i++) {
        // ⭐TODO: 只支持 .vue ? jsx, tsx, js, ts ？
        if (modulesList[i].id && (modulesList[i].id as string).endsWith('.vue'))
          server.reloadModule(modulesList[i])
      }
    })
  }
}
