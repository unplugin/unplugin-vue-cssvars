<script setup lang="ts">
import { reactive, ref } from 'vue'
import Comp from './comp.vue'
const color = 'green'
const appAsd = () => 'red'
const fooColor = appAsd()
const appTheme2 = 'blue'
const lessColor = 'greenyellow'
const sassColor = ref('#94c9ff')
const stylColor = '#fd1d7c'
const appTheme3 = ref('red')
const appTheme4 = reactive({ color: 'red' })
const appTheme5 = { color: 'red' }
const appTheme6 = () => 'red'
</script>
<!--
<script lang="ts">
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
  <div class="scss" @click="sassColor = 'red'">
    TEST
    <Comp />
  </div>
</template>

<style lang="scss">
/* foo.scss -> test2.css -> test.css */
/* foo.scss -> test.scss -> test2.css */

/*@import "./assets/less/less-foo";*/

@import './assets/scss/foo.scss';
</style>
