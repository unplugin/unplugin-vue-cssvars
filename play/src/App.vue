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
 div {
   color: v-bind(color)
 }
</style>
