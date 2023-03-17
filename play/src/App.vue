<script setup lang="ts">
import { reactive, ref } from 'vue'
/* import Comp from './comp.vue' */
const appAsd = () => 'red'
const color = appAsd()
const appTheme2 = 'blue'
const appTheme3 = ref('red')
const appTheme4 = reactive({ color: 'red' })
const appTheme5 = { color: 'red' }
const appTheme6 = () => 'red'
</script>
<!-- <script lang="ts">
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
export default {
  setup() {
    const color3 = 'red'
    return {
      color2: 'blue',
    }
  },
  data() {
    return {
      color: 'red',
    }
  },
}
</script> -->

<template>
  <div class="test">
    TEST
    <!--    <Comp /> -->
  </div>
</template>

<style scoped lang="scss">
@import "./assets/test";
/* div {
   color: v-bind(color2)
 }*/
</style>
