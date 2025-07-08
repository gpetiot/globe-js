<template>
  <div class="intro-container">
    <!-- Info button - always visible -->
    <button
      v-show="!isOpen"
      class="info-button"
      @click="openPanel"
      aria-label="Show app introduction"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    </button>

    <!-- Panel -->
    <Transition name="fade">
      <div
        v-show="isOpen"
        id="intro-panel"
        class="intro-panel"
        role="dialog"
        aria-label="About This App"
      >
        <div class="panel-header">
          <h1>About This Interactive Globe</h1>
          <button class="close-button" @click="closePanel" aria-label="Close introduction">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="panel-content">
          <p class="intro-text">
            Explore a 3D interactive globe. This app is built with Vue 3 and THREE.js.
          </p>
          <p class="intro-text">
            View the source code on
            <a href="https://github.com/gpetiot/globe-js" target="_blank" rel="noopener">GitHub</a>.
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(true)
const openPanel = () => {
  isOpen.value = true
}
const closePanel = () => {
  isOpen.value = false
}
</script>

<style scoped>
.intro-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 1.5rem;
}

.info-button {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.info-button:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-active);
  color: var(--color-text);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.intro-panel {
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
  pointer-events: auto;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.panel-header h1 {
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-button {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.close-button:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.1);
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.panel-content {
  padding: 1.5rem;
}

.intro-text {
  margin: 0;
  color: var(--color-text);
  line-height: 1.7;
  font-size: 0.95rem;
  max-width: 65ch;
}

a {
  color: #60a5fa;
  text-decoration: underline;
  transition: color 0.2s;
}
a:hover,
a:focus {
  color: #38bdf8;
  text-decoration: underline;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 768px) {
  .intro-container {
    padding: 1rem;
  }

  .panel-header {
    padding: 0.75rem 1rem;
  }

  .panel-header h1 {
    font-size: 1.25rem;
  }

  .panel-content {
    padding: 1rem;
  }

  .close-button {
    width: 1.75rem;
    height: 1.75rem;
  }

  .info-button {
    bottom: 1rem;
    right: 1rem;
    width: 2.25rem;
    height: 2.25rem;
  }

  .info-button svg {
    width: 1.125rem;
    height: 1.125rem;
  }
}
</style>
