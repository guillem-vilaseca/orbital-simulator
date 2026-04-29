# Simulador d'Òrbites 3D (Mètode Runge-Kutta 4)
[🌍 Veure en Producció](https://orbital-simulator-six.vercel.app/)

Aquest projecte és un simulador de mecànica orbital interactiu que permet visualitzar constel·lacions de satèl·lits en temps real.

## Característiques Principals

- **Integració Numèrica:** Implementació del mètode de Runge-Kutta de 4t ordre (RK4) per resoldre les equacions del moviment.
- **Interfície Interactiva:** Ajust de paràmetres orbitals (semieix major, excentricitat) en temps real.

## Arquitectura del Sistema

El projecte està construït seguint una arquitectura modular en Vue 3 i TypeScript:

1.  **Capa Lògica (`src/logic/physics.ts`):** Conté el "motor" físic. És totalment independent de la vista i s'encarrega de les matemàtiques pures (càlcul d'acceleracions i passos d'integració).
2.  **Capa de Visualització (`src/components/SimScene.vue`):** Utilitza **TresJS** (un wrapper de Three.js per a Vue) per renderitzar l'escena 3D. Gestiona la Terra, la il·luminació i la malla instanciada dels satèl·lits.
3.  **Capa de Control (`src/App.vue`):** Gestiona l'estat global de la simulació, la interfície d'usuari i la reactivitat dels paràmetres.

## Fonaments Matemàtics

Segueix aquest enllaç per veure les matemàtiques del projecte: [Fonaments de mecànica orbital](src\logic\orbital_mechanics.md)


## Consideracions Tècniques i Rendiment

Aquest projecte s'ha desenvolupat en l'ecosistema web (JavaScript/TypeScript) principalment com una prova de concepte per motius de comoditat, accessibilitat i per aconseguir una visualització 3D ràpida al navegador. 

Sóc plenament conscient que JavaScript no és l'entorn òptim ni l'estàndard  per a simulacions numèriques. En iteracions futures el motor de càlcul s'hauria de delegar a tecnologies de més alt rendiment, com ara Rust + WebAssembly o WebGPU.

---
*Projecte desenvolupat per Guillem Vilaseca*