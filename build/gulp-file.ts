import * as path from 'path'
import { series } from 'gulp'
import fs, { copySync } from 'fs-extra'
import pkg from '../package.json'
import { run } from './utils'
import { parallelTask } from './rewirte-path'
const distRoot = path.resolve(process.cwd(), '../dist')
const moveDistToRoot = async() => {
  const distPathInBuild = path.resolve(process.cwd(), 'dist')
  await copySync(distPathInBuild, distRoot)
}

const movePkgToRootDist = async() => {
  const content = JSON.parse(JSON.stringify(pkg))
  Reflect.deleteProperty(content, 'scripts')
  Reflect.deleteProperty(content, 'lint-staged')
  Reflect.deleteProperty(content, 'devDependencies')
  Reflect.deleteProperty(content, 'eslintConfig')
  content.scripts = {
    publish: 'pnpm publish --no-git-checks --access public',
  }
  content.type = 'module'
  await fs.writeJson(`${distRoot}/package.json`, content, { spaces: 2 })
}

const moveReadMeToRootDist = async() => {
  await fs.copy(`${path.resolve('../README.md')}`, `${distRoot}/README.md`)
  await fs.copy(`${path.resolve('../README.ZH-CN.md')}`, `${distRoot}/README.ZH-CN.md`)
}

export default series(
  ...parallelTask(),
  // 移动dist
  async() => {
    const res = await moveDistToRoot()
    return res
  },
  // 移动 package.json 到 dist
  async() => {
    const res = await movePkgToRootDist()
    return res
  },
  async() => {
    const res = await moveReadMeToRootDist()
    return res
  },
  // 删build目录下dist
  async() => {
    const res = await run('pnpm run --filter @unplugin-vue-cssvars/build clean')
    return res
  },
)
