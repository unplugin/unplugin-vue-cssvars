<script setup lang="ts">
import { reactive, ref } from 'vue'
const color = ref('blue')
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

<template>
  <div id="foo" class="scss" @click="sassColor = 'red'">
    <p>app122</p>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/css/foo.css';
</style>
