<script setup lang="ts">
import { computed } from 'vue'
import Tagalog from './panels/Tagalog.vue'

type SectionId = 'tagalog' | null

interface Props {
  activeSection: SectionId
}

const props = defineProps<Props>()

const currentComponent = computed(() => {
  switch (props.activeSection) {
    case 'tagalog':
      return Tagalog
    default:
      return null
  }
})
</script>

<template>
  <Transition name="panel">
    <aside v-if="activeSection" class="panel" role="complementary" :aria-label="activeSection">
      <div class="panel-content">
        <component :is="currentComponent" v-if="currentComponent" />
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(90vw, 500px);
  height: 100vh;
  background: var(--color-surface);
  backdrop-filter: blur(8px);
  border-left: 1px solid var(--color-border);
  z-index: 50;
}

.panel-content {
  height: 100%;
  padding: 5rem 1.5rem 1.5rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Smooth slide transition */
.panel-enter-active,
.panel-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
