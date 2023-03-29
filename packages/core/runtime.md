# ！！！核心流程改变
预处理
1.分析 css Module Map
根据文件，分析路径树。以及对应文件的 v-bind-m 集合
foo.css
#app {
    color: v-bind-m(fooColor)
}
{ xxxx/xxxx/foo.css: ["fooColor"]}

/******************************************************
transform pre
2. 获取原始 sfc 中的 descriptor 中获得的 style、importer 信息，与步骤1对比
得到 sfc -》 css module path tree

3.分析原始的 sfc 中的变量，
与步骤2 中的变量做匹配，得到命中的变量， 并保存其代码
提取规则与 1.0.0 保持一直，
{
    xxxx/xxxx/app.vue : {
        fooColor: 'const fooColor = ref('color')'
    }
}
// 后面做
tips: 是否支持从外部js导入的代码定义
import c from 'c'
const cc = c

4. transform post 阶段
根据步骤3中该组件的变量
注入 useCssVars 方法，这里如果sfc本身有 useCssVars 方法，则添加到末尾
这里害得记录对应的 cssvars 哈希，组件哈希等
5. 在build bundle 阶段，改写 css