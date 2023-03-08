import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    minify: false
  },
  plugins: [
    vue(),
    {
      name: 'asdwqdqwdwqd',
      resolveId(source, importer, options){
        //console.log(source, importer, options)
      },
      load(id){
        //console.log(id + '###\n')
      },
      transform(code: string, id: string){
        if(!/node_modules/.test(id)){
          console.log(code + '###\n')
        }

      },
    },
  ],
})
