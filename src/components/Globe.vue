<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CONTINENTAL_POINTS } from '../data/globeData'

const canvasContainer = ref<HTMLDivElement | null>(null)
let controls: OrbitControls

// Globe configuration
const GLOBE_RADIUS = 1
const ROTATION_SPEED = 0.0002 // Slower default rotation
const POINT_SIZE = 0.0525 // Increased by 50%

// Colors
const LAND_COLOR = new THREE.Color(0x333333) // Dark gray for land
const OCEAN_COLOR = new THREE.Color(0xcccccc) // Light gray for ocean

// Custom shader for fixed lighting
const fixedLightVertexShader = `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
}`

const fixedLightFragmentShader = `
uniform vec3 diffuse;
uniform float opacity;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 normal = normalize(vNormal);
    
    // Fixed light direction in world space
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 fillLightDir = normalize(vec3(-1.0, -1.0, -1.0));
    
    // Calculate diffuse lighting
    float mainDiff = max(dot(normal, lightDir), 0.0);
    float fillDiff = max(dot(normal, fillLightDir), 0.0) * 0.4;
    
    // Ambient light
    float ambient = 0.5;
    
    // Combine lighting
    vec3 totalLight = vec3(ambient + mainDiff + fillDiff);
    
    gl_FragColor = vec4(diffuse * totalLight, opacity);
}`

let scene: THREE.Scene
let rotatingGroup: THREE.Group
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let globe: THREE.Mesh
let points: THREE.Points
let frameId: number

const createPointsGeometry = (): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry()
  const pointsData: number[] = []
  const pointColors: number[] = []

  CONTINENTAL_POINTS.forEach((region) => {
    region.forEach(([lng, lat]) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)

      const x = -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = GLOBE_RADIUS * Math.cos(phi)
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)

      // Add subtle jitter for natural look
      const jitter = (Math.random() - 0.5) * 0.02
      pointsData.push(x + jitter, y + jitter, z + jitter)
      pointColors.push(LAND_COLOR.r, LAND_COLOR.g, LAND_COLOR.b)
    })
  })

  console.log(`Generated ${pointsData.length / 3} points`)

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsData, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3))

  return geometry
}

const onWindowResize = () => {
  const container = canvasContainer.value
  if (!container || !camera || !renderer) return

  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

const init = () => {
  if (!canvasContainer.value) {
    throw new Error('Canvas container not found')
  }

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.z = 3

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  canvasContainer.value.appendChild(renderer.domElement)

  // Create rotating group for the globe and points
  rotatingGroup = new THREE.Group()
  scene.add(rotatingGroup)

  // Create base globe (ocean) with fixed lighting
  const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 0.99, 64, 64)
  const sphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      diffuse: { value: OCEAN_COLOR },
      opacity: { value: 0.9 },
    },
    vertexShader: fixedLightVertexShader,
    fragmentShader: fixedLightFragmentShader,
    transparent: true,
  })
  globe = new THREE.Mesh(sphereGeometry, sphereMaterial)
  rotatingGroup.add(globe)

  // Create points for landmasses
  const pointsGeometry = createPointsGeometry()

  // Custom point material with fixed lighting
  const pointVertexShader = `
    attribute vec3 color;
    varying vec3 vColor;
    
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = ${POINT_SIZE} * (300.0 / -mvPosition.z);
    }
  `

  const pointFragmentShader = `
    varying vec3 vColor;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      float alpha = smoothstep(0.5, 0.4, dist); // Maintaining circular shape with soft edges
      gl_FragColor = vec4(vColor, alpha * 0.9);
    }
  `

  const pointsMaterial = new THREE.ShaderMaterial({
    vertexShader: pointVertexShader,
    fragmentShader: pointFragmentShader,
    transparent: true,
  })

  points = new THREE.Points(pointsGeometry, pointsMaterial)
  rotatingGroup.add(points)

  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = 0.5
  controls.enableZoom = false
  controls.enablePan = false

  // Handle window resize
  window.addEventListener('resize', onWindowResize)
}

const animate = () => {
  if (!rotatingGroup) return

  // Auto-rotate when not being controlled
  if (!controls.enabled) {
    rotatingGroup.rotation.y += ROTATION_SPEED
  }

  controls.update()
  renderer.render(scene, camera)
  frameId = requestAnimationFrame(animate)
}

onMounted(() => {
  init()
  animate()
})

onBeforeUnmount(() => {
  if (frameId) {
    cancelAnimationFrame(frameId)
  }
  window.removeEventListener('resize', onWindowResize)
  if (controls) {
    controls.dispose()
  }
  if (points) {
    points.geometry.dispose()
    ;(points.material as THREE.Material).dispose()
  }
  if (globe) {
    globe.geometry.dispose()
    ;(globe.material as THREE.Material).dispose()
  }
  if (rotatingGroup) {
    scene.remove(rotatingGroup)
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<template>
  <div ref="canvasContainer" class="globe-container"></div>
</template>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  background: transparent;
  margin: 0;
  padding: 0;
  position: relative;
}
</style>
