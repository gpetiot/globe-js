<script setup lang="ts">
import { papers } from '@/data/softwareVerificationPapers'
</script>

<template>
  <div class="research-papers">
    <div v-for="(paper, index) in papers" :key="index" class="paper-card">
      <div class="paper-header">
        <h3>{{ paper.title }}</h3>
        <span v-if="paper.language" class="language-tag">
          {{ paper.language }}
        </span>
      </div>
      <p class="authors">{{ paper.authors }}</p>
      <div class="paper-links">
        <a
          v-for="(link, linkIndex) in paper.links"
          :key="linkIndex"
          :href="link.url"
          target="_blank"
          :class="[
            'link-btn',
            link.text.toLowerCase().includes('pdf')
              ? 'pdf-link'
              : link.text.toLowerCase().includes('award')
                ? 'award-link'
                : 'ref-link',
          ]"
          :title="`Open ${link.text} in new tab`"
        >
          <span class="icon">
            {{
              link.text.toLowerCase().includes('pdf')
                ? '📄'
                : link.text.toLowerCase().includes('award')
                  ? '🏆'
                  : link.text.toLowerCase().includes('benchmark')
                    ? '📊'
                    : '🔗'
            }}
          </span>
          {{ link.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.research-papers {
  display: grid;
  gap: 1.5rem;
  padding: 0.5rem;
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.paper-card {
  display: grid;
  gap: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.paper-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(56, 189, 248, 0.03), rgba(232, 121, 249, 0.03));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.paper-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, rgba(56, 189, 248, 0.7), rgba(232, 121, 249, 0.7));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.paper-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(56, 189, 248, 0.1);
}

.paper-card:hover::before,
.paper-card:hover::after {
  opacity: 1;
}

.paper-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.paper-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  letter-spacing: -0.01em;
}

.language-tag {
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 9999px;
  text-transform: capitalize;
  color: rgba(56, 189, 248, 0.9);
  white-space: nowrap;
  letter-spacing: 0.025em;
  font-weight: 500;
}

.authors {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.paper-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.pdf-link {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

.pdf-link:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: translateY(-1px);
}

.award-link {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.3);
}

.award-link:hover {
  background: rgba(234, 179, 8, 0.25);
  transform: translateY(-1px);
}

.ref-link {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.3);
}

.ref-link:hover {
  background: rgba(56, 189, 248, 0.25);
  transform: translateY(-1px);
}

.icon {
  font-size: 1.1rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .paper-card {
    padding: 1.25rem;
  }

  .paper-header h3 {
    font-size: 1.05rem;
  }

  .authors {
    font-size: 0.9rem;
  }

  .link-btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.875rem;
  }
}
</style>
