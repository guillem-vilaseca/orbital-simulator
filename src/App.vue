<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import SimScene from './components/SimScene.vue'

const majorSemiaxis = ref(5.0)
const excentricity = ref(0.0) // 0 és circular , > 0 és el·líptica, < 0 és hiperbòlica (no vàlida per a la nostra simulació)

const SAFE_EARTH_RATIUS = 3.1 // Volem evitar que l'òrbita intersequi amb la Terra, així que establim un radi mínim segur.

// Calculem la excentricitat màxima: e_max = 1 - (R / a)
const maxExcentricity = computed(() => {
  const maxCalc = 1 - (SAFE_EARTH_RATIUS / majorSemiaxis.value)
  // Limitem entre 0 i 0.95 (per evitar òrbites hiperbòliques/apertes que trenquin l'el·lipse)
  return Math.max(0, Math.min(0.95, maxCalc))
})

// Si l'usuari redueix el semieix major, l'excentricitat actual podria convertir-se en il·legal.
// Aquest watch la redueix automàticament si superem el límit.
watch(maxExcentricity, (newMax) => {
  if (excentricity.value > newMax) {
    excentricity.value = Math.floor(newMax * 100) / 100 
  }
})
</script>

<template>
  <main>
    <div class="ui-panel">
      <h2>Paràmetres orbitals</h2>

      <div class="control-group">
        <label>Semieix major (a): {{ majorSemiaxis }}</label>
        <input type="range" v-model.number="majorSemiaxis" min="3.5" max="15" step="0.1" />
      </div>

      <div class="control-group">
        <label>Excentricitat (e): {{ excentricity }}</label>
        <input 
                type="range" 
                v-model.number="excentricity" 
                min="0" 
                :max="maxExcentricity" 
                step="0.01" 
              />      
      </div>
    </div>

    <TresCanvas window-size>
      <Suspense>
        <SimScene :a="majorSemiaxis" :e="excentricity" />
      </Suspense>
    </TresCanvas>
  </main>
</template>

<style>
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
  z-index: 10;
  font-family: system-ui, sans-serif;
  width: 250px;
}
.ui-panel h2 { margin-top: 0; font-size: 1.2rem; color: #fff; }
.control-group { margin-top: 15px; display: flex; flex-direction: column; }
.control-group label { margin-bottom: 8px; font-size: 0.9em; font-weight: bold; }
input[type="range"] { cursor: pointer; accent-color: #2b59c3; }
</style>