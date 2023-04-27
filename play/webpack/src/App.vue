<script setup lang="ts">
import { ref } from 'vue'
console.log(111111)
const color = ref('red')
const appAsd = () => 'green'
const fooColor = appAsd()
const msg = ref('aaaa')
</script>

<template>
  <div id="foo" class="scss">
    {{ msg }} a
  </div>
</template>

<style scoped>
@import "../src/assets/css/foo.css";
/*#foo{
  background: v-bind(fooColor);
  width: 300px;
}*/
</style>
