在build bundle 阶段，改写 css
似乎不太行得通....

TODO server 時 vbindVariableList 要按照組件存儲，避免後面你的覆蓋卡面的

方案一 打包時，每個組件路徑存一份样式文件，修改哈希， 參與css編譯
方案二 打包时，在transform 的 pre， 将每个零组件路径的样式进行提升注入，并抹除importer，参与vue编译