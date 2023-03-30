<script setup lang="ts">
import { reactive, ref } from 'vue'
const compAsd = () => 'red'
const color = 'yellow'
const compTheme1 = compAsd()
const compTheme2 = 'red'
const sassColor = 'pink'
const compTheme3 = ref('red')
const compTheme4 = reactive({ color: 'red' })
const compTheme5 = { color: 'red' }
const compTheme6 = () => 'red'
</script>

<template>
  <div class="test">
    comp
  </div>
</template>

 <style lang="scss">
/*@import "./assets/test.css";*/
div {
   color: v-bind(color)
 }
// @import './assets/scss/bar.scss';
.blue-btn {

  color: v-bind(sassColor);
}
</style>
