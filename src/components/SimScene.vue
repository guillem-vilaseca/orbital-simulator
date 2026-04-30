<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useLoop } from '@tresjs/core'
import { OrbitControls, useTextures, Stars } from '@tresjs/cientos'
import { Vector3, Mesh, Line, BufferGeometry, Float32BufferAttribute, Object3D } from 'three'
import { updateRK4, calculateOrbitPath, getStateAtAnomaly } from '../logic/physics'

const texturesPaths = [
  `${import.meta.env.BASE_URL}textures/earth_color.jpg`,
  `${import.meta.env.BASE_URL}textures/earth_normal.jpg`,
  `${import.meta.env.BASE_URL}textures/earth_specular.jpg`,
  `${import.meta.env.BASE_URL}textures/earth_clouds.jpg`
]

const textures = useTextures(texturesPaths)

const props = defineProps<{ a: number, e: number }>()

const orbitLineRef = shallowRef<Line | null>(null) 
const cloudsRef = shallowRef<Mesh | null>(null)

const SAT_COUNT = 150
const instancedMeshRef = shallowRef<any>(null)
const constelationPositions: Vector3[] = []
const constelationVelocities: Vector3[] = []
const dummy = new Object3D()

/**
 * Recalcula l'òrbita visual i la constel·lació de satèl·lits basant-se en els paràmetres actuals.
 * Actualitza la geometria de la línia orbital i reinicia les posicions i velocitats de la constel·lació.
 */
function resetOrbit() {
  if (!orbitLineRef.value) return

  // Generar els punts que formen l'elipse orbital
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

  // Buidar i reinicialitzar les posicions i velocitats dels satèl·lits
  constelationPositions.length = 0
  constelationVelocities.length = 0

for (let i = 0; i < SAT_COUNT; i++) {
    // Distribuir satèl·lits uniformement al voltant de l'òrbita
    const theta = (i / SAT_COUNT) * Math.PI * 2;
    const state = getStateAtAnomaly(props.a, props.e, theta);

    // Crear una dispersió 3D (forma de cilindre) afegint petites inclinacions aleatòries
    // Ajusta el valor de 'grosor' per modificar l'amplada de la dispersió
    const grosor = 0.3;
    const tiltX = (Math.random() - 0.5) * grosor; 
    const tiltY = (Math.random() - 0.5) * grosor;
    
    // Aplicar les inclinacions tant a la posició com a la velocitat per mantenir la física coherent
    state.pos.applyAxisAngle(new Vector3(1, 0, 0), tiltX);
    state.vel.applyAxisAngle(new Vector3(1, 0, 0), tiltX);
    
    state.pos.applyAxisAngle(new Vector3(0, 1, 0), tiltY);
    state.vel.applyAxisAngle(new Vector3(0, 1, 0), tiltY);

    // Guardar l'estat inicial de cada satèl·lit
    constelationPositions.push(state.pos);
    constelationVelocities.push(state.vel);
  }
}

watch(
  () => [props.a, props.e, orbitLineRef.value], 
  resetOrbit, 
  { immediate: true }
)

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  // Rotar les núvols de la Terra de forma contínua
  if (cloudsRef.value) {
    cloudsRef.value.rotation.y += delta * 0.015;
  }

  // Actualitzar la simulació física de la constel·lació de satèl·lits
  if (instancedMeshRef.value && constelationPositions.length === SAT_COUNT) {
    const dt = Math.min(delta, 0.1);
    
    for (let i = 0; i < SAT_COUNT; i++) {
      // Integrar la física orbital usant RK4 per a precisió
      updateRK4(constelationPositions[i], constelationVelocities[i], dt * 2);
      
      const pos = constelationPositions[i];
      const vel = constelationVelocities[i];

      // Posicionar el satèl·lit a les seves coordenades actuals
      dummy.position.copy(pos);

      // Orientar la geometria del satèl·lit cap a la seva direcció de moviment
      const futurePosition = pos.clone().add(vel);
      dummy.lookAt(futurePosition);
      
      // Actualitzar la matriu de transformació del satèl·lit
      dummy.updateMatrix();
      instancedMeshRef.value.setMatrixAt(i, dummy.matrix);
    }
    // Notificar a la GPU que les matrius d'instància s'han modificat
    instancedMeshRef.value.instanceMatrix.needsUpdate = true;
  }
});
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