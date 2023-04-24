<script setup lang="ts">
import { ref } from 'vue'
const color = ref('red')
const appAsd = () => 'green'
const fooColor = appAsd()
</script>

<template>
  <div id="foo" class="scss">
    app
  </div>
</template>

<style scoped>
@import '@/assets/css/foo.css';
#foo{
  background: v-bind(fooColor);
  width: 300px;
}
</style>
