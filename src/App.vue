<script setup lang="ts">
import Globe from './components/Globe.vue';
</script>

<template>
  <div class="app-container">
    <Globe />
  </div>
</template>

<style>
/* Reset default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000000;
}

/* Apply black background to the entire app */
:root {
  background: #000000;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
