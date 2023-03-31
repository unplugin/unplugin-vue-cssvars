<script setup lang="ts">
import { reactive, ref } from 'vue'
import Comp from './comp.vue'
const color = 'green'
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
<!--
<script lang="ts">
const sc2 = 'red'
</script> -->
<!-- <script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
/* import Comp from './comp.vue' */
const appAsd = () => 'red'
const color = appAsd()
const appTheme2 = 'red'
const appTheme3 = ref('red')
const appTheme4 = reactive({ color: 'red' })
const appTheme5 = { color: 'red' }
const appTheme6 = () => 'red'
export default defineComponent({
  setup() {
    const appAsd = () => 'red'
    const color = appAsd()
    const appTheme2 = 'red'
    const appTheme3 = ref('red')
    const appTheme4 = reactive({ color: 'red' })
    const appTheme5 = { color: 'red' }
    const appTheme6 = () => 'red'
    return {
      color,
      appTheme2,
      appTheme3,
      appTheme4,
      appTheme5,
      appTheme6,
    }
  },
})
</script> -->

<!-- <script>
import { defineComponent, reactive, ref } from 'vue'
export default defineComponent({
  setup() {
    const sassColor = ref('#88dc40')
    const stylColor = () => '#a609ff'
    return {
      sassColor,
      stylColor: stylColor(),
    }
  },
  data() {
    const sassColor = ref('#94c9ff')
    const stylColor = () => '#ffac07'
    return {
      color: 'red',
      sassColor,
      stylColor: stylColor(),
    }
  },
})
</script> -->

<template>
  <div class="scss" @click="sassColor = 'red'">
    app
    <Comp />
  </div>
</template>

<style lang="scss" scoped>
@import './assets/scss/mixin.scss';
@import './assets/scss/variables.module.scss';
/* foo.scss -> test2.css -> test.css */
/* foo.scss -> test.scss -> test2.css */

/*@import "./assets/less/less-foo";*/
/*div {
  color: v-bind(color)
}
@import './assets/scss/foo.scss';*/
.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$base-sidebar-width});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}

</style>
