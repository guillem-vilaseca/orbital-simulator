<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import SimScene from './components/SimScene.vue'

// Estado Reactivo de nuestra UI
const semiejeMayor = ref(5.0)
const excentricidad = ref(0.0) // 0 es circular, > 0 es elíptica

const RADIO_TIERRA_SEGURO = 3.1 // Radio 3 de la Tierra + 0.1 de margen de atmósfera

// Calculamos el máximo permitido usando la fórmula despejada: e_max = 1 - (R / a)
const maxExcentricidad = computed(() => {
  const maxCalc = 1 - (RADIO_TIERRA_SEGURO / semiejeMayor.value)
  // Limitamos entre 0 y 0.95 (para evitar órbitas hiperbólicas/abiertas que rompen la elipse)
  return Math.max(0, Math.min(0.95, maxCalc))
})

// Si el usuario reduce el semieje mayor, la excentricidad actual podría volverse ilegal.
// Este watch la empuja hacia abajo automáticamente si nos pasamos del límite.
watch(maxExcentricidad, (nuevoMax) => {
  if (excentricidad.value > nuevoMax) {
    // Redondeamos a 2 decimales para que el slider no se vuelva loco
    excentricidad.value = Math.floor(nuevoMax * 100) / 100 
  }
})
</script>

<template>
  <main>
    <div class="ui-panel">
      <h2>Parámetros Orbitales</h2>
      
      <div class="control-group">
        <label>Semieje Mayor (a): {{ semiejeMayor }}</label>
        <input type="range" v-model.number="semiejeMayor" min="3.5" max="15" step="0.1" />
      </div>

      <div class="control-group">
        <label>Excentricidad (e): {{ excentricidad }}</label>
        <input 
                type="range" 
                v-model.number="excentricidad" 
                min="0" 
                :max="maxExcentricidad" 
                step="0.01" 
              />      
      </div>
    </div>

    <TresCanvas window-size>
      <Suspense>
        <SimScene :a="semiejeMayor" :e="excentricidad" />
      </Suspense>
    </TresCanvas>
  </main>
</template>

<style>
/* CSS para que el panel flote de forma elegante estilo "Dashboard Espacial" */
.ui-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(4px);
  color: #e0e0e0;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #444;
  z-index: 10; /* Crítico: Asegura que el HTML esté encima del Canvas 3D */
  font-family: system-ui, sans-serif;
  width: 250px;
}
.ui-panel h2 { margin-top: 0; font-size: 1.2rem; color: #fff; }
.control-group { margin-top: 15px; display: flex; flex-direction: column; }
.control-group label { margin-bottom: 8px; font-size: 0.9em; font-weight: bold; }
input[type="range"] { cursor: pointer; accent-color: #2b59c3; }
</style>