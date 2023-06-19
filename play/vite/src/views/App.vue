<script setup lang="tsx">
import { reactive, ref, withDefaults, defineProps } from 'vue'
const appAsd = () => 'red' // √
const appTheme5 = { color: 'red' } // √
const appTheme6 = () => 'red' // √
const fn1 = function(){ // √
  console.log('aa')
}
function f2(){ // √
  console.log(1)
}

const fooColor = appAsd() // √
const appTheme3 = ref('red') // √
const appTheme4 = reactive({ color: 'red' })  // √

const a = 100// √
const appTheme2 = 'blue'// √
// const props = defineProps({color: {type: String}})  // √ !!
interface Props {
  msg?: string
  labels?: string[]
}

const propss = withDefaults(defineProps<Props>(), {
  msg: 'hello', // √
  labels: () => ['one', 'two'] // √
})
const { color } = propss // √
// ##########################
let appAsd2 = () => 'red'
let appTheme52 = { color: 'red' }
let appTheme62 = () => 'red'
let fn12 = function(){
  console.log('aa')
}
function f22(){
  console.log(1)
}

let fooColor2 = appAsd2()
let appTheme32 = ref('red')
let appTheme42 = reactive({ color: 'red' })

let a2 = 100
let appTheme22 = 'blue'
</script>

<script lang="jsx">
const sc2 = 'red'
</script>
<!-- <script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
/* import Comp from './comp.vue' */
const appAsd = () => 'red'
const color = appAsd()
const appTheme2 = 'red'
const appTheme3 = ref('red')
const appTheme4 = reactive({ color: 'red' })
const appTheme5 = { color: 'red' }
const appTheme6 = () => 'red'
export default defineComponent({
  setup() {
    const appAsd = () => 'red'
    const color = appAsd()
    const appTheme2 = 'red'
    const appTheme3 = ref('red')
    const appTheme4 = reactive({ color: 'red' })
    const appTheme5 = { color: 'red' }
    const appTheme6 = () => 'red'
    return {
      color,
      appTheme2,
      appTheme3,
      appTheme4,
      appTheme5,
      appTheme6,
    }
  },
})
</script> -->

<!-- <script>
import { defineComponent, reactive, ref } from 'vue'
export default defineComponent({
  setup() {
    const sassColor = ref('#88dc40')
    const stylColor = () => '#a609ff'
    return {
      sassColor,
      stylColor: stylColor(),
    }
  },
  data() {
    const sassColor = ref('#94c9ff')
    const stylColor = () => '#ffac07'
    return {
      color: 'red',
      sassColor,
      stylColor: stylColor(),
    }
  },
})
</script> -->

<template>
  <div id="foo" class="scss" @click="sassColor = 'red'">
    <p>app122</p>
    <compjsx />
    <!--    <Comp />
    <Comp2 /> -->
  </div>
</template>

 <style lang="scss" scoped>
@import '@/assets/css/foo.css';
</style>
