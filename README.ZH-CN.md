# unplugin-vue-cssvars
🌀 A vue plugin that allows you to use vue's CSSVars feature in css files

[English](https://github.com/baiwusanyu-c/unplugin-vue-cssvars/blob/master/README.md) | 中文

## Feature (TODO)

* 🌈 TODO
* 🌌 TODO
* 🌊 TODO
* ⛰ TODO

## Install

```bash
npm i unplugin-vue-cssvars -D
```
Or
```bash
yarn add unplugin-vue-cssvars -D
```
Or
```bash
pnpm add unplugin-vue-cssvars -D
```

## Usage
<details>
<summary>Vite</summary>

```ts
// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { viteVueCSSVars } from 'unplugin-vue-cssvars'
import type { PluginOption } from 'vite'
export default defineConfig({
  plugins: [
    viteVueCSSVars(/* options */) as PluginOption,
  ],
})
```

</details>
<br>
<details>
<summary>Rollup</summary>

```ts
// rollup.config.js
import { resolve } from 'path'
import { rollupVueCSSVars } from 'unplugin-vue-cssvars'
export default {
  plugins: [
    rollupVueCSSVars(/* options */),
  ],
}
```

</details>
<br>
<details>
<summary>Webpack</summary>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-vue-cssvars').webpackVueCSSVars({ /* options */ }),
  ],
}
```
</details>
<br>
<details>
<summary>Vue CLI</summary>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-vue-cssvars').webpackVueCSSVars({ /* options */ }),
    ],
  },
}
```

</details>
<br>
<details>
<summary>esbuild</summary>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import { esbuildVueCSSVars } from 'unplugin-vue-cssvars'

build({
  plugins: [esbuildVueCSSVars(/* options */)],
})
```
</details>

## Option

```typescript
export interface Options {
  /**
   * Provide path which will be transformed
   *
   * @default process.cwd()
   */
  rootDir?: string
  /**
   * RegExp or glob to match files to be transformed
   */
  include?: FilterPattern

  /**
   * RegExp or glob to match files to NOT be transformed
   */
  exclude?: FilterPattern

  /**
   * unplugin-vue-cssvars depends on the vue compiler,
   * there may be duplicate css after packaging, here we clear it
   */
  revoke?: boolean
}
```
## Tips TODO
### 转换分析时的约定规则
1. sfc 中，如果 @import 指定了后缀，则根据后缀的文件进行转换分析，否则根据当前 script 标签的 lang 属性（默认css）进行转换分析。
2. css中规则：css文件只能引用 css 文件，只会解析 css 后缀的文件
3. scss、less、stylus 中规则：scss、less、stylus文件可以引用 css 文件、以及对应的scss或less文件或stylus文件，则对同名文件的css文件和对应的预处理器后缀文件进行转换分析
## Thanks TODO
