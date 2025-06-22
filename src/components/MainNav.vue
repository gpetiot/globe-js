<script setup lang="ts">
const sections = {
  tagalog: {
    id: 'tagalog',
    title: 'Tagalog',
  },
} as const

type SectionId = keyof typeof sections

interface Props {
  activeSection: SectionId | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', sectionId: SectionId | null): void
}>()

const toggleSection = (sectionId: SectionId) => {
  emit('select', props.activeSection === sectionId ? null : sectionId)
}
</script>

<template>
  <nav class="main-nav" role="navigation" aria-label="Main sections">
    <div class="nav-buttons">
      <button
        v-for="section in Object.values(sections)"
        :key="section.id"
        class="nav-button"
        :class="{ active: activeSection === section.id }"
        @click="toggleSection(section.id)"
        :aria-pressed="activeSection === section.id"
      >
        {{ section.title }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.main-nav {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem;
  z-index: 100;
  pointer-events: none;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  padding: 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-button {
  padding: 0.4rem 0.75rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.375rem;
  color: rgba(226, 232, 240, 0.8);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  letter-spacing: 0.01em;
}

.nav-button:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(56, 189, 248, 0.2);
  color: rgba(255, 255, 255, 0.95);
}

.nav-button.active {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}
</style>
