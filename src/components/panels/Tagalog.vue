<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '📚',
    title: 'Interactive Learning',
    description:
      'Learn Tagalog through carefully designed lessons, from basic conversations to advanced topics. Courses follow modern language teaching standards with clear progression paths.',
  },
  {
    icon: '🇵🇭',
    title: 'Cultural Integration',
    description:
      'Discover Filipino culture alongside language learning. Each lesson incorporates cultural elements, from traditional customs to modern daily life.',
  },
  {
    icon: '🎯',
    title: 'Practical Focus',
    description:
      'Focus on practical, everyday Tagalog. Learn through real-world scenarios, common expressions, and natural dialogue patterns.',
  },
]
</script>

<template>
  <div class="tagalog-content">
    <div class="main-content">
      <div class="overview">
        <h2>Try Tagalog</h2>
        <p class="intro">
          An innovative platform for learning Tagalog, the most widely spoken language in the
          Philippines. Try Tagalog combines modern language teaching methods with cultural immersion
          for an effective and engaging learning experience.
        </p>
      </div>

      <div class="features">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon">{{ feature.icon }}</div>
          <div class="feature-content">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="about">
        <h3>About the Project</h3>
        <p>
          Try Tagalog is born from a collaborative vision of making Filipino language learning
          accessible worldwide. Created by Guillaume Petiot and Dr. Anna-Victoria Terrado, the
          platform brings together technological innovation and authentic Filipino cultural
          expertise.
        </p>
        <p>
          Whether you're connecting with Filipino heritage, preparing for travel, or expanding your
          linguistic horizons, Try Tagalog offers a structured path to language proficiency.
        </p>
        <div class="cta">
          <a href="https://trytagalog.com" target="_blank" class="cta-button">
            Explore Try Tagalog →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tagalog-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0.5rem;
  animation: fade-in 0.5s ease-out;
  max-width: 1200px;
  margin: 0 auto;
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

.main-content {
  display: grid;
  gap: 3rem;
}

.overview {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.overview h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.intro {
  font-size: 1.25rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 1.5rem auto;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  display: grid;
  gap: 1rem;
  align-content: start;
}

.feature-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(56, 189, 248, 0.1);
}

.feature-icon {
  font-size: 2rem;
  line-height: 1;
}

.feature-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.5rem;
}

.feature-content p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

.about {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.about h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 1.5rem;
}

.about p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
}

.about p:last-of-type {
  margin-bottom: 2rem;
}

.cta {
  display: flex;
  justify-content: center;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: #38bdf8;
  color: #0f172a;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: #0ea5e9;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .overview h2 {
    font-size: 2rem;
  }

  .intro {
    font-size: 1.1rem;
  }

  .about {
    padding: 1.5rem;
  }

  .about p {
    font-size: 1rem;
  }

  .cta-button {
    width: 100%;
    justify-content: center;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }
}
</style>
