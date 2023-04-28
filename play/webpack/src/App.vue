<script setup lang="ts">
import { ref } from 'vue'
import Comp from '@/comp.vue'
import Comp2 from '@/comp2.vue'
const color = ref('red')
const appAsd = () => 'green'
const fooColor = appAsd()
const msg = ref('aa')
</script>

<template>
  <div id="foo" class="scss">
    {{ msg }} a
    <Comp />
    <Comp2 />
  </div>
</template>
