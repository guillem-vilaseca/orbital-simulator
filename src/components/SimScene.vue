<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useLoop } from '@tresjs/core'
import { OrbitControls, useTextures } from '@tresjs/cientos'
import { Vector3, Mesh, Line, BufferGeometry, Float32BufferAttribute } from 'three'
import { updateRK4, getInitialState, calculateOrbitPath } from '../logic/physics'

const textures = useTextures(['/textures/earth_color.jpg', '/textures/earth_normal.jpg', '/textures/earth_specular.jpg', '/textures/earth_clouds.jpg'])

const props = defineProps<{ a: number, e: number }>()

const satelliteRef = shallowRef<Mesh | null>(null)
// 1. Nueva referencia para la línea entera (no solo la geometría)
const orbitLineRef = shallowRef<Line | null>(null) 

const cloudsRef = shallowRef<Mesh | null>(null)

const satellitePosition = new Vector3()
const satelliteVelocity = new Vector3()

function resetOrbit() {
  // 2. Seguridad: Si la línea 3D aún no se ha montado en la pantalla, esperamos.
  if (!orbitLineRef.value) return

  const initialState = getInitialState(props.a, props.e)
  satellitePosition.copy(initialState.position)
  satelliteVelocity.copy(initialState.velocity)

  const points = calculateOrbitPath(props.a, props.e)
  const float32Array = new Float32Array(points.length * 3)
  
  points.forEach((p, i) => {
    float32Array[i * 3] = p.x
    float32Array[i * 3 + 1] = p.y
    float32Array[i * 3 + 2] = p.z
  })

  // 3. LA MAGIA: Asignación imperativa. Nos saltamos a Vue totalmente.
  // Destruimos la vieja para limpiar RAM
  if (orbitLineRef.value.geometry) {
    orbitLineRef.value.geometry.dispose()
  }
  
  // Creamos y asignamos la nueva directamente al objeto de Three.js
  const newGeometry = new BufferGeometry()
  newGeometry.setAttribute('position', new Float32BufferAttribute(float32Array, 3))
  orbitLineRef.value.geometry = newGeometry
}

// 4. Vigilar las props Y el momento en que la línea se monta en el DOM
watch(
  () => [props.a, props.e, orbitLineRef.value], 
  resetOrbit, 
  { immediate: true }
)

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  if (satelliteRef.value) {
    const dt = Math.min(delta, 0.1) 
    updateRK4(satellitePosition, satelliteVelocity, dt * 2)
    satelliteRef.value.position.copy(satellitePosition)
  }

  if(cloudsRef.value) {
    cloudsRef.value.rotation.y += delta * 0.015;
  }
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 15, 20]" :fov="45" :near="0.1" :far="1000" />
  <OrbitControls />

  <TresAmbientLight :intensity="0.05" />
  <TresDirectionalLight :position="[20, 5, 10]" :intensity="3" />

  <TresMesh>
    <TresSphereGeometry :args="[3, 64, 64]" /> 
    <TresMeshStandardMaterial :map="textures.textures.value[0]" :normalMap="textures.textures.value[1]" :roughnessMap="textures.textures.value[2]" />
  </TresMesh>
  
  <TresMesh ref="cloudsRef">
    <TresSphereGeometry :args="[3.03, 64, 64]" />
    <TresMeshStandardMaterial 
      :alphaMap="textures.textures.value[3]" 
      :transparent="true" 
      :opacity="0.8" 
      color="#ffffff"
      :depthWrite="false" 
    />
  </TresMesh>

  <TresMesh ref="satelliteRef"> 
    <TresSphereGeometry :args="[0.2, 16, 16]" />
    <TresMeshBasicMaterial color="#ff3333" />
  </TresMesh>

  <TresLine ref="orbitLineRef">
    <TresLineBasicMaterial color="#aaaaaa" :transparent="true" :opacity="0.4" />
  </TresLine>
</template>