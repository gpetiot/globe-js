import * as THREE from 'three'

export interface AirplaneConfig {
  altitude: number
  orbitSpeed: number
  initialAngle?: number
  color?: number
  orbitTilt?: number // Tilt of the orbit in radians
}

export class Airplane {
  private group: THREE.Group
  private plane!: THREE.Group // Initialized in createAirplane()
  private path!: THREE.Line // Initialized in createPath()
  private orbitAngle: number
  private config: AirplaneConfig

  constructor(config: AirplaneConfig) {
    this.config = {
      color: 0xffffff, // Default to white
      initialAngle: 0,
      orbitTilt: 0, // Default to no tilt
      ...config,
    }
    this.orbitAngle = this.config.initialAngle || 0
    this.group = new THREE.Group()

    // Apply orbit tilt before creating airplane and path
    if (this.config.orbitTilt) {
      this.group.rotation.x = this.config.orbitTilt
    }

    this.createAirplane()
    this.createPath()
  }

  private createAirplane() {
    // Create a detailed airplane shape
    const fuselageGeometry = new THREE.CylinderGeometry(0.01, 0.015, 0.08, 8)
    const noseGeometry = new THREE.ConeGeometry(0.015, 0.02, 8)
    const wingGeometry = new THREE.BoxGeometry(0.12, 0.005, 0.03)
    const tailFinGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.005)
    const stabilizersGeometry = new THREE.BoxGeometry(0.04, 0.005, 0.02)

    // Create materials with some shading
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: this.config.color,
      shininess: 100,
      specular: 0x666666,
    })

    // Create and position fuselage
    const fuselage = new THREE.Mesh(fuselageGeometry, planeMaterial)
    fuselage.rotation.z = Math.PI / 2

    // Add nose cone
    const nose = new THREE.Mesh(noseGeometry, planeMaterial)
    nose.position.x = 0.05
    nose.rotation.z = Math.PI / 2

    // Add main wings
    const wings = new THREE.Mesh(wingGeometry, planeMaterial)
    wings.position.x = -0.01
    wings.rotation.y = Math.PI / 2

    // Add tail fin (vertical stabilizer)
    const tailFin = new THREE.Mesh(tailFinGeometry, planeMaterial)
    tailFin.position.x = -0.04
    tailFin.position.y = 0.015

    // Add horizontal stabilizers
    const stabilizers = new THREE.Mesh(stabilizersGeometry, planeMaterial)
    stabilizers.position.x = -0.04
    stabilizers.rotation.y = Math.PI / 2

    // Create plane group and add all parts
    this.plane = new THREE.Group()
    this.plane.add(fuselage)
    this.plane.add(nose)
    this.plane.add(wings)
    this.plane.add(tailFin)
    this.plane.add(stabilizers)

    // Position the plane at starting point
    this.plane.position.set(this.config.altitude, 0, 0)
    this.plane.rotation.y = Math.PI / 2
    this.group.add(this.plane)
  }

  private createPath() {
    const pathGeometry = new THREE.BufferGeometry()
    const pathPoints = []
    const pathSegments = 100

    for (let i = 0; i <= pathSegments; i++) {
      const angle = (i / pathSegments) * Math.PI * 2
      const x = Math.cos(angle) * this.config.altitude
      const z = Math.sin(angle) * this.config.altitude
      pathPoints.push(new THREE.Vector3(x, 0, z))
    }
    pathGeometry.setFromPoints(pathPoints)

    const pathMaterial = new THREE.LineDashedMaterial({
      color: this.config.color,
      dashSize: 0.05,
      gapSize: 0.03,
      opacity: 0.4,
      transparent: true,
    })

    this.path = new THREE.Line(pathGeometry, pathMaterial)
    this.path.computeLineDistances()
    this.group.add(this.path)
  }

  update() {
    this.orbitAngle += this.config.orbitSpeed * 0.01

    // Update group rotation for orbit
    this.group.rotation.y = this.orbitAngle

    // Add banking effect to make turns look more realistic
    const bankAngle = Math.sin(this.orbitAngle) * 0.2
    this.plane.rotation.z = bankAngle

    // Add slight pitch and yaw variations for more natural movement
    const pitchWobble = Math.sin(this.orbitAngle * 2) * 0.03
    const yawWobble = Math.cos(this.orbitAngle * 3) * 0.02
    this.plane.rotation.x = pitchWobble
    this.plane.rotation.y = Math.PI / 2 + yawWobble
  }

  getObject(): THREE.Group {
    return this.group
  }

  dispose() {
    // Clean up geometries and materials
    this.plane.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
    if (this.path.geometry) {
      this.path.geometry.dispose()
    }
    if (this.path.material instanceof THREE.Material) {
      this.path.material.dispose()
    }
  }
}
