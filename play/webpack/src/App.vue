<script setup lang="ts">
import { reactive, ref } from 'vue'
import Comp from '../../comp.vue'
const color = ref('blue')
const appAsd = () => 'red'
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
}
</style>
