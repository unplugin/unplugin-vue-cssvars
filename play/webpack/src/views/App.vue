<script lang="tsx">
import { defineProps, reactive, ref, withDefaults } from 'vue'
/*
const propss = withDefaults(defineProps<Props>(), {
  msg: 'hello', // √
  labels: () => ['one', 'two'], // √
}); const appAsd = () => 'red' // √
const appTheme5 = { color: 'red' } // √
const appTheme6 = () => 'red' // √
const fn1 = function() { // √
  console.log('aa')
}
function f2() { // √
  console.log(1)
}

const fooColor = appAsd() // √
const appTheme3 = ref('red') // √
const appTheme4 = reactive({ color: 'red' }) // √
*/

// √
/* const appTheme2 = 'blue'// √
// const props = defineProps({color: {type: String}})  // √ !!
interface Props {
  msg?: string
  labels?: string[]
}

const { color } = propss // √ */
// ##########################
/* const appAsd2 = () => 'red'
const appTheme52 = { color: 'red' }
const appTheme62 = () => 'red'
const fn12 = function() {
  console.log('aa')
}
function f22() {
  console.log(1)
}

const fooColor2 = appAsd2()
const appTheme32 = ref('red')
const appTheme42 = reactive({ color: 'red' })

const a2 = 100
const appTheme22 = 'blue' */

export default {
  setup: () => {
    const a = 100
    const b = 200
    const foo = 300
    return {
      a,
      b,
      foo,
    }
  },
}
</script>

<!-- <script lang="tsx">
const sc2 = 'red'
</script> -->
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
  <div>
    1
  </div>
  <p>
    1
  </p>
</template>

<style scoped>
@import '@/assets/css/foo.css';
</style>
