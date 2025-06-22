<script setup lang="ts">
import { teachings } from '@/data/logicProgrammingLessons'
</script>

<template>
  <div class="teaching-content">
    <div v-for="(course, index) in teachings" :key="index" class="course-card">
      <div class="course-header">
        <h3>{{ course.title }}</h3>
        <span v-if="course.language" class="language-tag">
          {{ course.language }}
        </span>
      </div>
      <div class="course-meta">
        <span class="institution">{{ course.institution }}</span>
        <span class="period">{{ course.period }}</span>
      </div>
      <p class="description">{{ course.description }}</p>
      <div class="course-materials">
        <a
          v-for="(link, linkIndex) in course.links"
          :key="linkIndex"
          :href="link.url"
          target="_blank"
          :class="[
            'link-btn',
            link.url.endsWith('.pdf')
              ? 'pdf-link'
              : link.url.endsWith('.pl')
                ? 'code-link'
                : 'ref-link',
          ]"
          :title="`Open ${link.text} in new tab`"
        >
          <span class="icon">
            {{ link.url.endsWith('.pdf') ? '📄' : link.url.endsWith('.pl') ? '📝' : '🔗' }}
          </span>
          {{ link.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teaching-content {
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

.course-card {
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

.course-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(56, 189, 248, 0.03), rgba(232, 121, 249, 0.03));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card::after {
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

.course-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(56, 189, 248, 0.1);
}

.course-card:hover::before,
.course-card:hover::after {
  opacity: 1;
}

.course-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.course-header h3 {
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

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.institution {
  color: rgba(56, 189, 248, 0.9);
  font-weight: 500;
}

.period {
  padding-left: 1rem;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.description {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.course-materials {
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

.code-link {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
}

.code-link:hover {
  background: rgba(34, 197, 94, 0.25);
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
  .course-card {
    padding: 1.25rem;
  }

  .course-header h3 {
    font-size: 1.05rem;
  }

  .course-meta,
  .description {
    font-size: 0.9rem;
  }

  .link-btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.875rem;
  }

  .period {
    padding-left: 0.75rem;
  }
}
</style>
