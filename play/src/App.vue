<script setup lang="ts">
import { ref } from 'vue'
const color = ref('red')
</script>

<template>
  <div>
    TEST
  </div>
</template>

<style scoped>
@import "./test.css";
/* div {
   color: v-bind(color)
 }*/
</style>
