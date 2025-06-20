<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CONTINENTAL_POINTS } from '../data/globeData'

// Tooltip state
interface TooltipState {
  visible: boolean
  text: string
  x: number
  y: number
}

const tooltip = ref<TooltipState>({
  visible: false,
  text: '',
  x: 0,
  y: 0,
})

const canvasContainer = ref<HTMLDivElement | null>(null)
let controls: OrbitControls

// Globe configuration
const GLOBE_RADIUS = 1
const ROTATION_SPEED = 0.0002 // Slower default rotation
const POINT_SIZE = 0.0525 // Base point size
const SPECIAL_POINT_SIZE = 0.079 // 150% of regular point size
const HOVER_DETECTION_RADIUS = 1.2 // Only 20% increase for more precise detection

// Track the currently hovered city
const hoveredCity = ref<string>('')

// Special city locations [longitude, latitude]
const SPECIAL_LOCATIONS = {
  Paris: [2.3522, 48.8566],
  Grenoble: [5.7245, 45.1885],
  Manila: [120.9842, 14.5995],
  Salisbury: [-1.7947, 51.0689],
}

// Colors
const LAND_COLOR = new THREE.Color(0x424242) // Softer dark gray for land
const OCEAN_COLOR = new THREE.Color(0xb2bec8) // Softer gray-blue for ocean
const SPECIAL_COLOR = new THREE.Color(0xff4444) // Bright red for special locations

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
  const pointSizes: number[] = []

  // Add special locations first
  Object.values(SPECIAL_LOCATIONS).forEach(([lng, lat]) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
    const y = GLOBE_RADIUS * Math.cos(phi)
    const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)

    pointsData.push(x, y, z)
    pointColors.push(SPECIAL_COLOR.r, SPECIAL_COLOR.g, SPECIAL_COLOR.b)
    pointSizes.push(SPECIAL_POINT_SIZE)
  })

  // Add continental points
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
      pointSizes.push(POINT_SIZE)
    })
  })

  console.log(`Generated ${pointsData.length / 3} points`)

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsData, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(pointSizes, 1))

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
  scene.background = new THREE.Color(0x1a1a2e) // Rich dark blue-black background

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
    attribute float size;
    varying vec3 vColor;
    varying float vSpecial;
    varying vec3 vPosition;
    
    void main() {
      vColor = color;
      vPosition = position;
      // Detect if it's a special point by checking its size
      vSpecial = size > ${POINT_SIZE + 0.001} ? 1.0 : 0.0;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      // Special points are always rendered on top
      gl_Position.z = vSpecial > 0.0 ? -0.99 * gl_Position.w : gl_Position.z;
      gl_PointSize = size * (300.0 / -mvPosition.z);
    }
  `

  const pointFragmentShader = `
    uniform vec3 hoveredPosition;
    varying vec3 vColor;
    varying float vSpecial;
    varying vec3 vPosition;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      // Hard cutoff for flat circle with very slight antialiasing
      float alpha = 1.0 - smoothstep(0.48, 0.5, dist);
      
      // Check if this point is hovered
      bool isHovered = vSpecial > 0.0 && length(vPosition - hoveredPosition) < 0.001;
      
      // Add enhanced glow effect for special points
      if (vSpecial > 0.0) {
        // Outer glow effect
        float glowAlpha = smoothstep(1.0, 0.2, dist) * (isHovered ? 0.8 : 0.5);
        vec3 glowColor = isHovered ? 
          vec3(1.0, 0.6, 0.6) : // Brighter, warmer glow for hovered
          vec3(1.0, 0.3, 0.3);  // Normal glow
        
        // Increase brightness when hovered
        vec3 finalColor = isHovered ? 
          mix(vColor * 1.5, glowColor, 0.7) : // Brighter mix when hovered
          mix(vColor, glowColor, 0.5);        // Normal mix
        
        // Combine flat circle with glow
        gl_FragColor = vec4(finalColor, alpha + (1.0 - alpha) * glowAlpha);
      } else {
        gl_FragColor = vec4(vColor, alpha);
      }
    }
  `

  const pointsMaterial = new THREE.ShaderMaterial({
    uniforms: {
      hoveredPosition: { value: new THREE.Vector3(0, 0, 0) },
    },
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

  // Handle window resize and mouse events
  window.addEventListener('resize', onWindowResize)
  canvasContainer.value.addEventListener('mousemove', checkSpecialPointHover)
  canvasContainer.value.addEventListener('mouseleave', () => {
    tooltip.value.visible = false
  })

  // Handle mouse move for tooltip
  const onMouseMove = (event: MouseEvent) => {
    // Check if hovering over special points
    checkSpecialPointHover(event)
  }

  window.addEventListener('mousemove', onMouseMove)

  // Clean up event listener on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
  })
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

// Check if the mouse is hovering over a special point
const checkSpecialPointHover = (event: MouseEvent) => {
  if (!canvasContainer.value || !camera || !points) return

  // Convert mouse position to normalized device coordinates
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Create vectors for calculation
  const mouse3D = new THREE.Vector3(x, y, 0.5)

  // Unproject the mouse position to get a point in 3D space
  mouse3D.unproject(camera)
  const rayCaster = new THREE.Vector3()
  rayCaster.subVectors(mouse3D, camera.position).normalize()

  // Calculate intersection with sphere
  const sphereCenter = new THREE.Vector3(0, 0, 0)
  const a = rayCaster.dot(rayCaster)
  const b = 2 * rayCaster.dot(camera.position)
  const c = camera.position.dot(camera.position) - GLOBE_RADIUS * GLOBE_RADIUS
  const discriminant = b * b - 4 * a * c

  if (discriminant >= 0) {
    // Ray intersects sphere, calculate the intersection point
    const t = (-b - Math.sqrt(discriminant)) / (2 * a)
    const intersection = new THREE.Vector3()
    intersection.copy(camera.position).add(rayCaster.multiplyScalar(t))

    // Convert intersection point back to lat/long
    const lat = 90 - (Math.acos(intersection.y / GLOBE_RADIUS) * 180) / Math.PI
    const lng = (Math.atan2(intersection.z, -intersection.x) * 180) / Math.PI - 180

    // Check distance to special points
    let closestCity = ''
    let minDistance = Infinity
    let closestPoint = new THREE.Vector3()

    Object.entries(SPECIAL_LOCATIONS).forEach(([city, [cityLng, cityLat]]) => {
      // Convert city coordinates to 3D position
      const phi = (90 - cityLat) * (Math.PI / 180)
      const theta = (cityLng + 180) * (Math.PI / 180)

      const x = -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = GLOBE_RADIUS * Math.cos(phi)
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
      const cityPoint = new THREE.Vector3(x, y, z)

      // Convert degrees to radians for spherical distance calculation
      const λ1 = (lng * Math.PI) / 180
      const φ1 = (lat * Math.PI) / 180
      const λ2 = (cityLng * Math.PI) / 180
      const φ2 = (cityLat * Math.PI) / 180

      // Haversine formula for great-circle distance
      const Δλ = Math.abs(λ2 - λ1)
      const Δφ = Math.abs(φ2 - φ1)
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = GLOBE_RADIUS * c

      // Use smaller detection radius
      if (distance < SPECIAL_POINT_SIZE * HOVER_DETECTION_RADIUS && distance < minDistance) {
        closestCity = city
        minDistance = distance
        closestPoint.copy(cityPoint)
      }
    })

    if (closestCity) {
      // Update shader uniform with hovered point position
      ;(points.material as THREE.ShaderMaterial).uniforms.hoveredPosition.value.copy(closestPoint)
      hoveredCity.value = closestCity
      tooltip.value = {
        visible: true,
        text: closestCity,
        x: event.clientX + 15,
        y: event.clientY,
      }
      return
    }
  }

  // Reset hover state when no point is hovered
  hoveredCity.value = ''
  ;(points.material as THREE.ShaderMaterial).uniforms.hoveredPosition.value.set(0, 0, 0)
  tooltip.value.visible = false
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
  canvasContainer.value?.removeEventListener('mousemove', checkSpecialPointHover)
  canvasContainer.value?.removeEventListener('mouseleave', () => {
    tooltip.value.visible = false
  })
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
  <div ref="canvasContainer" class="globe-container">
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      {{ tooltip.text }}
    </div>
  </div>
</template>

<style scoped>
.globe-container {
  position: relative;
}

.tooltip {
  position: fixed;
  transform: translate(0, -50%);
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: opacity 0.15s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.globe-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  background: radial-gradient(
    circle at center,
    var(--background-secondary) 0%,
    var(--background-primary) 100%
  );
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.2);
}
</style>
