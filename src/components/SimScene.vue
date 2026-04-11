<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useLoop } from '@tresjs/core'
import { OrbitControls, useTextures, Stars } from '@tresjs/cientos'
// --- NUEVO: Importaciones de Post-Procesado y Object3D ---
import { EffectComposer, BloomPmndrs  } from '@tresjs/post-processing'
import { Vector3, Mesh, Line, BufferGeometry, Float32BufferAttribute, Object3D } from 'three'
import { updateRK4, getInitialState, calculateOrbitPath } from '../logic/physics'

const textures = useTextures(['/textures/earth_color.jpg', '/textures/earth_normal.jpg', '/textures/earth_specular.jpg', '/textures/earth_clouds.jpg'])

const props = defineProps<{ a: number, e: number }>()

const orbitLineRef = shallowRef<Line | null>(null) 
const cloudsRef = shallowRef<Mesh | null>(null)

// --- NUEVO: Estado de la Constelación (150 Satélites) ---
const SAT_COUNT = 150
const instancedMeshRef = shallowRef<any>(null)
const constelationPositions: Vector3[] = []
const constelationVelocities: Vector3[] = []
const dummy = new Object3D() // Objeto matemático temporal para mover las instancias

function resetOrbit() {
  if (!orbitLineRef.value) return

  // 1. DIBUJAR LA LÍNEA TEÓRICA CENTRAL (la que controlas con los sliders)
  const points = calculateOrbitPath(props.a, props.e)
  const float32Array = new Float32Array(points.length * 3)
  
  points.forEach((p, i) => {
    float32Array[i * 3] = p.x
    float32Array[i * 3 + 1] = p.y
    float32Array[i * 3 + 2] = p.z
  })

  if (orbitLineRef.value.geometry) {
    orbitLineRef.value.geometry.dispose()
  }
  
  const newGeometry = new BufferGeometry()
  newGeometry.setAttribute('position', new Float32BufferAttribute(float32Array, 3))
  orbitLineRef.value.geometry = newGeometry

  // --- NUEVO: 2. RECALCULAR LA CONSTELACIÓN ---
  // Vaciamos los arrays
  constelationPositions.length = 0
  constelationVelocities.length = 0

  for (let i = 0; i < SAT_COUNT; i++) {
    // Les damos una pequeña variación matemática a cada satélite basándonos en tu UI
    const randomA = props.a + (Math.random() - 0.5) * 1.5 // Variación en tamaño
    const randomE = Math.max(0, Math.min(0.8, props.e + (Math.random() - 0.5) * 0.1)) // Variación en excentricidad
    
    const initialState = getInitialState(randomA, randomE)
    const pos = initialState.position
    const vel = initialState.velocity

    // MAGIA ESPACIAL: Dispersamos las órbitas usando álgebra lineal (rotaciones)
    // Para que no salgan todos en fila india, los rotamos en el eje Y (Longitud del Nodo)
    const angleY = Math.random() * Math.PI * 2
    pos.applyAxisAngle(new Vector3(0, 1, 0), angleY)
    vel.applyAxisAngle(new Vector3(0, 1, 0), angleY)

    // Los inclinamos ligeramente en el eje X para que formen una red global
    const angleX = (Math.random() - 0.5) * Math.PI * 0.5
    pos.applyAxisAngle(new Vector3(1, 0, 0), angleX)
    vel.applyAxisAngle(new Vector3(1, 0, 0), angleX)

    // Guardamos su estado inicial
    constelationPositions.push(pos)
    constelationVelocities.push(vel)
  }
}

watch(
  () => [props.a, props.e, orbitLineRef.value], 
  resetOrbit, 
  { immediate: true }
)

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  // Rotación de las nubes
  if(cloudsRef.value) {
    cloudsRef.value.rotation.y += delta * 0.015;
  }

  // --- NUEVO: FÍSICA MULTI-CUERPO PARA LA CONSTELACIÓN ---
  if (instancedMeshRef.value && constelationPositions.length === SAT_COUNT) {
    const dt = Math.min(delta, 0.1) 
    
   for (let i = 0; i < SAT_COUNT; i++) {
      // 1. Física RK4
      updateRK4(constelationPositions[i], constelationVelocities[i], dt * 2)
      
      const pos = constelationPositions[i]
      const vel = constelationVelocities[i]

      // 2. Posición
      dummy.position.copy(pos)

      // 3. MATEMÁTICA DE ORIENTACIÓN (Nuevo)
      // Calculamos hacia dónde se dirige (Posición + Velocidad)
      const futurePosition = pos.clone().add(vel)
      dummy.lookAt(futurePosition) // El frente de la geometría mirará hacia este punto
      
      // 4. Actualizamos la matriz
      dummy.updateMatrix()
      instancedMeshRef.value.setMatrixAt(i, dummy.matrix)
    }
    // 4. Le avisamos a la GPU que ha habido un cambio global
    instancedMeshRef.value.instanceMatrix.needsUpdate = true
  }
})
</script>

<template>
  <TresPerspectiveCamera :position="[0, 15, 20]" :fov="45" :near="0.1" :far="1000" />
  <OrbitControls />
  <Stars :radius="100" :depth="50" :count="5000" :size="0.1" :size-attenuation="true" />

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

  <TresLine ref="orbitLineRef">
    <TresLineBasicMaterial color="#aaaaaa" :transparent="true" :opacity="0.4" />
  </TresLine>

<TresInstancedMesh ref="instancedMeshRef" :args="[undefined, undefined, SAT_COUNT]">
    <TresBoxGeometry :args="[0.03, 0.03, 0.1]" /> 
    
    <TresMeshStandardMaterial 
      color="#ffcc00" 
      :metalness="0.9" 
      :roughness="0.2" 
      emissive="#ffaa00" 
      :emissiveIntensity="3" 
    />
  </TresInstancedMesh>

</template>