<script lang="tsx">
/* import { reactive, ref } from 'vue'
const compAsd = () => 'red'
const color = 'red'
const compTheme1 = compAsd()
const compTheme2 = 'red'
const sassColor = 'pink'
const compTheme3 = ref('red')
const compTheme4 = reactive({ color: 'red' })
const compTheme5 = { color: 'red' }
const compTheme6 = () => 'red' */
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    return () => (<div>test</div>)
  },
})
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
