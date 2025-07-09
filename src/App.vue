<template>
  <div class="app">
    <Globe />
    <IntroPanel />
    <a
      href="https://github.com/gpetiot/globe-js"
      class="github-corner"
      target="_blank"
      rel="noopener"
      aria-label="View source on GitHub"
    >
      <svg width="28" height="28" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="rgba(30,41,59,0.85)" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8 2C5.24 2 3 4.24 3 7c0 2.2 1.44 4.06 3.44 4.66.25.05.34-.11.34-.24 0-.12-.01-.52-.01-.94-1.4.3-1.7-.68-1.7-.68-.23-.58-.56-.74-.56-.74-.46-.32.03-.31.03-.31.5.03.76.51.76.51.45.76 1.18.54 1.47.41.05-.33.18-.54.33-.66-1.12-.13-2.3-.56-2.3-2.5 0-.55.2-1 .52-1.36-.05-.13-.23-.65.05-1.36 0 0 .42-.13 1.38.52.4-.11.82-.16 1.24-.16.42 0 .84.05 1.24.16.96-.65 1.38-.52 1.38-.52.28.71.1 1.23.05 1.36.32.36.52.81.52 1.36 0 1.94-1.18 2.37-2.3 2.5.18.16.35.47.35.95 0 .69-.01 1.25-.01 1.42 0 .13.09.29.34.24C11.56 11.06 13 9.2 13 7c0-2.76-2.24-5-5-5z"
          fill="currentColor"
        />
      </svg>
    </a>
  </div>
</template>

<script setup lang="ts">
import Globe from './components/Globe.vue'
import IntroPanel from './components/IntroPanel.vue'
</script>

<style>
.app {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.github-corner {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 200;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}
.github-corner:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-active);
  color: var(--color-text);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.github-label {
  display: inline-block;
  vertical-align: middle;
  font-size: 1rem;
  font-weight: 500;
  color: inherit;
  letter-spacing: 0.01em;
  margin-right: 0.1em;
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
