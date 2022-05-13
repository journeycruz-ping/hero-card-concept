import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Loading
const textureLoader = new THREE.TextureLoader()

const normalTexture = textureLoader.load('../textures/earthNormalMap.png')
const baseColorMap = textureLoader.load('../textures/Metal_Rusted_010_basecolor.jpg')
const aoMap1 = textureLoader.load('../textures/Metal_Rusted_010_ambientOcclusion.jpg')
const heightMap = textureLoader.load('../textures/Metal_Rusted_010_height.png')
const metalMap = textureLoader.load('../textures/Metal_Rusted_010_metallic.jpg')
const normalTexture2 = textureLoader.load('../textures/Metal_Rusted_010_normal.jpg')
const roughnessMap = textureLoader.load('../textures/Metal_Rusted_010_roughness.jpg')

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry = new THREE.SphereBufferGeometry(.5, 64, 64)

// Materials

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.2
material.roughness = 0.7
material.map = baseColorMap
material.aoMap = aoMap1
material.height = heightMap
material.normalMap = normalTexture2
material.roughnessMap = roughnessMap
material.metalnessMap = metalMap

// Mesh
const sphere = new THREE.Mesh(geometry, material)
scene.add(sphere)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
pointLight.intensity = 2.14
scene.add(pointLight)

const light1 = gui.addFolder('Light 1')

const pointLight2 = new THREE.PointLight(0xffffff, 2)
pointLight2.intensity = 0
pointLight2.position.set(-1.71, 1, -2.5)
scene.add(pointLight2)

const light2 = gui.addFolder('Light 2')

const pointLight3 = new THREE.PointLight(0xffffff, 2)
pointLight3.intensity = 0
pointLight3.position.set(6, 1, -9.5)
scene.add(pointLight3)

const light3 = gui.addFolder('Light 3')

light1.add(pointLight.position, 'y').min(-3).max(0.24).step(0.01)
light1.add(pointLight.position, 'x').min(-6).max(6).step(0.01)
light1.add(pointLight.position, 'z').min(-3).max(0.24).step(0.01)
light1.add(pointLight, 'intensity').min(0).max(10).step(0.01)

light2.add(pointLight2.position, 'y').min(-3).max(0.24).step(0.01)
light2.add(pointLight2.position, 'x').min(-6).max(6).step(0.01)
light2.add(pointLight2.position, 'z').min(-10).max(0.24).step(0.01)
light2.add(pointLight2, 'intensity').min(0).max(10).step(0.01)

light3.add(pointLight3.position, 'y').min(-3).max(0.24).step(0.01)
light3.add(pointLight3.position, 'x').min(-6).max(6).step(0.01)
light3.add(pointLight3.position, 'z').min(-10).max(0.24).step(0.01)
light3.add(pointLight3, 'intensity').min(0).max(10).step(0.01)

const pointLightHelper = new THREE.PointLightHelper(pointLight2, 1)
const pointLightHelper2 = new THREE.PointLightHelper(pointLight3, 1)

// scene.add(pointLightHelper)
// scene.add(pointLightHelper2)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)

camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

document.addEventListener('mousemove', onDocumentMouseMove)

let mouseX = 0
let mouseY = 0

let targetX = 0
let targetY = 0

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX)
    mouseY = (event.clientY - windowHalfY)
}

window.addEventListener('scroll', updateSphere)

function updateSphere(event) {
    sphere.position.y = window.scrollY * .001
}

const clock = new THREE.Clock()

const tick = () => {
    targetX = mouseX * .001
    targetY = mouseY * .001

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = .5 * elapsedTime
    sphere.rotation.y += .5 * (targetX - sphere.rotation.y)
    sphere.rotation.x += .5 * (targetY - sphere.rotation.x)
    sphere.position.z += .5 * (targetY - sphere.rotation.x)
        // Update Orbital Controls
        // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()