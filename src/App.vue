<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

// Más adelante, aquí irá la lógica matemática y de estado.
// Por ahora, solo importamos los componentes base.
</script>

<template>
  <TresCanvas window-size>
    
    <TresPerspectiveCamera
      :position="[0, 5, 15]" 
      :fov="45"
      :near="0.1"
      :far="1000"
    />
    
    <OrbitControls />

    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

    <TresMesh>
      <TresSphereGeometry :args="[3, 32, 32]" />
      <TresMeshStandardMaterial color="#2b59c3" wireframe />
    </TresMesh>

    <TresMesh :position="[5, 0, 0]"> 
      <TresSphereGeometry :args="[0.2, 16, 16]" />
      <TresMeshBasicMaterial color="#ff3333" />
    </TresMesh>

  </TresCanvas>
</template>