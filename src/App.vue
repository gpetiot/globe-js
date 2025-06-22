<template>
  <div class="app">
    <Globe />
    <MainNav :active-section="activeSection" @select="handleSectionSelect" />
    <Panel :active-section="activeSection" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Globe from './components/Globe.vue'
import MainNav from './components/MainNav.vue'
import Panel from './components/Panel.vue'

// Type for section IDs
type SectionId = 'verification' | 'tagalog' | 'prolog'
const activeSection = ref<SectionId | null>(null)

// Handle section selection from nav
const handleSectionSelect = (sectionId: SectionId | null) => {
  activeSection.value = sectionId === activeSection.value ? null : sectionId
}
</script>

<style>
.app {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
:root {
  --color-bg: rgb(15, 23, 42);
  --color-text: rgb(226, 232, 240);
  --color-text-muted: rgb(148, 163, 184);
  --color-primary: rgb(56, 189, 248);
  --color-surface: rgba(30, 41, 59, 0.8);
  --color-border: rgba(255, 255, 255, 0.1);
  --color-border-active: rgba(56, 189, 248, 0.3);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}
</style>
