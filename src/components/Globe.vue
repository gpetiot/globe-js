<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CONTINENTAL_POINTS } from '../data/globeData'
import { SPECIAL_LOCATIONS } from '../data/locations'
import { Airplane } from './Airplane'

// Types
interface TooltipState {
  visible: boolean
  text: string
  x: number
  y: number
}

interface CityInfo {
  title: string
  description?: string
}

// State
const tooltip = ref<TooltipState>({
  visible: false,
  text: '',
  x: 0,
  y: 0,
})

const hoveredCity = ref<string>('')
const hoveredCityInfo = computed<CityInfo | null>(() => {
  if (!hoveredCity.value) return null
  const location = SPECIAL_LOCATIONS[hoveredCity.value]
  return location
    ? {
        title: location.title,
        description: location.description,
      }
    : null
})

const canvasContainer = ref<HTMLDivElement | null>(null)
let controls: OrbitControls

// Globe configuration
const GLOBE_RADIUS = 1
const PLANE_ALTITUDE = GLOBE_RADIUS * 1.15 // Plane flies 15% higher than globe radius
const PLANE_ORBIT_SPEED = 0.5 // Rotation speed
const POINT_SIZE = 0.0525 // Base point size
const SPECIAL_POINT_SIZE = 0.079 // 150% of regular point size
const HOVER_DETECTION_RADIUS = 0.8 // Reduced from 1.2 for more precise detection

// Colors
const LAND_COLOR = new THREE.Color(0x64748b) // Brighter slate blue for land points
const OCEAN_COLOR = new THREE.Color(0x334155) // Medium slate blue for ocean
const SPECIAL_COLOR = new THREE.Color(0xff3d47) // Vivid red for special locations

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

const fixedLightFragmentShader = `    uniform vec3 diffuse;
    uniform float opacity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
        vec3 normal = normalize(vNormal);
        
        // Enhanced lighting setup with stronger contrast
        vec3 mainLightDir = normalize(vec3(1.0, 1.0, 1.0));
        vec3 fillLightDir = normalize(vec3(-1.0, -0.5, -0.8));
        vec3 rimLightDir = normalize(vec3(0.0, 1.0, 0.2));
        
        // Calculate multiple light contributions with increased intensity
        float mainDiff = max(dot(normal, mainLightDir), 0.0) * 1.2; // Increased main light
        float fillDiff = max(dot(normal, fillLightDir), 0.0) * 0.4; // Stronger fill light
        float rimLight = pow(1.0 - max(dot(normal, normalize(-vViewPosition)), 0.0), 3.0) * 0.5; // Enhanced rim
        
        // Brighter ambient light
        float ambient = 0.45;
        
        // Combine lighting with subtle color variation
        vec3 mainColor = diffuse;
        vec3 deepColor = mainColor * 0.8; // Slightly darker version for depth
        vec3 totalLight = vec3(ambient + mainDiff + fillDiff + rimLight);
        
        // Mix between main color and deep color based on lighting
        vec3 finalColor = mix(deepColor, mainColor, totalLight);
        
        gl_FragColor = vec4(finalColor, opacity);
}`

// Scene objects
let airplanes: Airplane[] = []
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
  Object.values(SPECIAL_LOCATIONS).forEach(({ coords }) => {
    const [lng, lat] = coords
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
  scene.background = new THREE.Color(0x0f1729) // Dark blue background with slight color shift for better contrast

  // Add lights for MeshPhongMaterial
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
  mainLight.position.set(1, 1, 1)
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(-1, -0.5, -0.8)
  scene.add(fillLight)

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

  // Create and add airplanes
  // Create plane configurations
  const planeConfigs = [
    {
      altitude: PLANE_ALTITUDE,
      orbitSpeed: PLANE_ORBIT_SPEED,
      color: 0xffffff, // White color
      initialAngle: 0,
    },
    {
      altitude: PLANE_ALTITUDE * 1.1, // 30% higher than the first plane
      orbitSpeed: PLANE_ORBIT_SPEED * 1.2, // 20% faster to compensate for larger orbit
      color: 0xffffff, // White color
      initialAngle: Math.PI, // Start on opposite side
      orbitTilt: Math.PI / 6, // 30 degree tilt
    },
  ]

  // Create and add all planes to the scene
  airplanes = planeConfigs.map((config) => {
    const plane = new Airplane(config)
    scene.add(plane.getObject())
    return plane
  })

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
      
      // Enhanced glow effect for special points with modern look
      if (vSpecial > 0.0) {
        // Dynamic outer glow effect
        float glowDist = smoothstep(1.0, 0.2, dist);
        float pulseEffect = isHovered ? 
          (sin(gl_FragCoord.w * 20.0) * 0.1 + 0.9) : 1.0; // Subtle pulse when hovered
        float glowAlpha = glowDist * (isHovered ? 0.85 : 0.6) * pulseEffect;
        
        // Vibrant color palette for glow
        vec3 glowColor = isHovered ? 
          vec3(1.0, 0.8, 0.8) : // Brighter, warmer glow for hovered
          vec3(1.0, 0.5, 0.5);  // Stronger base glow
        
        // Enhanced brightness with more pronounced color shift
        vec3 baseColor = vColor * (isHovered ? 2.0 : 1.4);
        float colorShift = isHovered ? 0.85 : 0.7;
        vec3 finalColor = mix(baseColor, glowColor, colorShift);
        
        // Add enhanced inner glow
        float innerGlow = (1.0 - dist * dist) * 0.35;
        finalColor += glowColor * innerGlow * (isHovered ? 1.0 : 0.5);
        
        // Combine everything with smooth transition
        gl_FragColor = vec4(finalColor, alpha + (1.0 - alpha) * glowAlpha);
      } else {
        // Enhanced rim lighting for better visibility of regular points
        float rimLight = pow(1.0 - dist, 2.5) * 0.45;
        vec3 finalColor = vColor * 1.2 + vec3(rimLight); // Increased base brightness
        gl_FragColor = vec4(finalColor, alpha);
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
    depthTest: true,
    depthWrite: true,
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
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.2

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

  // Update all airplanes
  airplanes.forEach((plane) => plane.update())

  controls.update() // This will handle the auto-rotation
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

    Object.entries(SPECIAL_LOCATIONS).forEach(([city, data]) => {
      const [cityLng, cityLat] = data.coords
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
      hoveredCity.value = closestCity
      return
    }
  }

  // Reset hover state when no point is hovered
  hoveredCity.value = ''
  ;(points.material as THREE.ShaderMaterial).uniforms.hoveredPosition.value.set(0, 0, 0)
  tooltip.value = {
    visible: false,
    text: '',
    x: 0,
    y: 0,
  }
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
  // Dispose all airplanes
  airplanes.forEach((plane) => plane.dispose())
  airplanes = []
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
      v-if="tooltip.visible && hoveredCityInfo"
      class="tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-title">{{ hoveredCityInfo.title }}</div>
      <div v-if="hoveredCityInfo.description" class="tooltip-description">
        {{ hoveredCityInfo.description }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.globe-container {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: radial-gradient(circle at center, #334155 0%, #1e293b 100%);
  box-shadow:
    inset 0 0 100px rgba(0, 0, 0, 0.25),
    inset 0 0 200px rgba(56, 189, 248, 0.15);
  overflow: hidden;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-enter-from.right,
.slide-leave-to.right {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-from.left,
.slide-leave-to.left {
  transform: translateX(-100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tooltip */
.tooltip {
  position: fixed;
  transform: translate(0, -50%);
  background-color: rgba(15, 23, 42, 0.95);
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-description {
  font-size: 13px;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.tooltip-year {
  font-size: 12px;
  color: #94a3b8;
}
</style>
