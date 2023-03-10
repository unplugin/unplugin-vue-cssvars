<script setup lang="ts">
import { reactive, ref } from 'vue'
import Comp from './comp.vue'
const appAsd = () => 'red'
const appTheme1 = appAsd()
const appTheme2 = 'red'
const appTheme3 = ref('red')
const appTheme4 = reactive({ color: 'red' })
const appTheme5 = { color: 'red' }
const appTheme6 = () => 'red'
</script>

<template>
  <div class="test">
    TEST
    <Comp />
  </div>
</template>

<style scoped>
@import "./assets/test";
/* @import "./test2.css"; */
/* div {
   color: v-bind(color)
 }*/
</style>
