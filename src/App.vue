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
    <a 
      href="https://github.com/guillem-vilaseca/orbital-simulator" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="github-link"
      title="Veure codi a GitHub"
    >
      <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="github-icon">
        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
      </svg>
    </a>

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
    <div class="github-icon">
      <h2>hello</h2>
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

.ui-panel h2 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #fff;
}

.control-group { 
  margin-top: 15px; 
  display: flex; 
  flex-direction: column; 
}

.control-group label { 
  margin-bottom: 8px; 
  font-size: 0.9em; 
  font-weight: bold; 
}

input[type="range"] { 
  cursor: pointer; 
  accent-color: #2b59c3; 
}

.github-link {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(20, 20, 25, 0.85);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.github-link:hover {
  background-color: white;
  transform: scale(1.05);
}

.github-icon {
  fill: white;
  transition: fill 0.2s ease-in-out;
}

.github-link:hover .github-icon {
  fill: #141419;
}
</style>