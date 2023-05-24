<script setup lang="tsx">
import { ref } from 'vue'
// import Comp from '../components/comp.vue'
// import Comp2 from '../components/comp2.vue'
const color = ref('red')
const appAsd = () => 'green'
const fooColor = appAsd()
const msg = ref('aa')
const compjsx = <p>test</p>
</script>

<template>
  <div id="foo" class="scss">
    <p>{{ msg }}</p>
    <compjsx />
    <!--    <Comp />
    <Comp2 /> -->
  </div>
</template>

<style scoped>
@import "../assets/css/foo.css";
</style>
