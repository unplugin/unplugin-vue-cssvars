import * as process from 'process'
import * as path from 'path'
import { dest, parallel, src } from 'gulp'
import { relativeDir } from './utils'
import type { TaskFunction } from 'gulp'

/**
 * Define the replacement dependency path here,
 * the path is the dist directory to the directory corresponding to the real file.
 * In monorepo, you may not want each sub-repository to be published separately on npm,
 * and you don't want to package all the code together,
 * but the directory structure of the packaged product may be the same as your single-repository structure,
 * so after the packaging is completed, we Dependency paths need to be replaced
 */
const distDirMap = {
  '@unplugin-vue-cssvars/utils': '../dist/utils/index[format]',
  '@unplugin-vue-cssvars/core': '../dist/core/index[format]',
}
const formatList = [
  { runPath: path.resolve(process.cwd(), '../dist/**/*.js'), format: '.js' },
  { runPath: path.resolve(process.cwd(), '../dist/**/*.cjs'), format: '.cjs' },
  { runPath: path.resolve(process.cwd(), '../dist/**/*.d.ts'), format: '' },
]

export const parallelTask = () => {
  const parallelTaskList: TaskFunction[] = []
  formatList.forEach((formatVal) => {
    parallelTaskList.push(parallel(() => {
      return src(formatVal.runPath)
        .on('data', (fileData) => {
          // 当前读取的文件内容
          let content = fileData.contents.toString()
          // 当前读取的文件路径
          const filePath = fileData.path.replaceAll('\\', '/')

          for (const distDirMapKey in distDirMap) {
            // 生产要替换的依赖路径 @xxxx ->  ../xxxx
            let targetPath = path.resolve(
              process.cwd(),
              distDirMap[distDirMapKey as keyof typeof distDirMap])
            // 替换格式后缀 .[format] -> .js / .cjs
            targetPath = targetPath.replace('[format]', formatVal.format)
            targetPath = targetPath.replaceAll('\\', '/')

            // 生产相对路径
            const relativePath = relativeDir(targetPath, filePath)
            // 替换依赖路径内容
            content = content.replaceAll(distDirMapKey, relativePath)
          }
          fileData.contents = Buffer.from(content)
        })
        .pipe(dest('dist'))
    }))
  })

  return parallelTaskList
}
