<script setup lang="ts">
import { ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import SimScene from './components/SimScene.vue'

// Estado Reactivo de nuestra UI
const semiejeMayor = ref(5.0)
const excentricidad = ref(0.0) // 0 es circular, > 0 es elíptica
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
        <input type="range" v-model.number="excentricidad" min="0" max="0.8" step="0.01" />
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