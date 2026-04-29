import { describe, it, expect } from 'vitest'
import { Vector3 } from 'three'
import { getInitialState, updateRK4, getStateAtAnomaly, MU } from './physics'

describe('Orbital Physics (physics.ts)', () => {
  
  describe('getInitialState', () => {
    it('calcula correctament la velocitat per a una òrbita circular (e = 0)', () => {
      const a = 10 // radi
      const e = 0
      const state = getInitialState(a, e)
      
      // En òrbita circular, la distància inicial (eix X) és igual al semieix major
      expect(state.position.x).toBeCloseTo(10)
      expect(state.position.y).toBe(0)
      expect(state.position.z).toBe(0)
      
      // La velocitat teòrica v = sqrt(MU / r) aplicat a l'eix Z
      const expectedV = Math.sqrt(MU / a)
      expect(state.velocity.x).toBe(0)
      expect(state.velocity.y).toBe(0)
      expect(state.velocity.z).toBeCloseTo(expectedV)
    })

    it('calcula correctament el periastre per a una òrbita el·líptica', () => {
      const a = 10
      const e = 0.5
      const state = getInitialState(a, e)
      
      // Periastre r = a * (1 - e)
      expect(state.position.x).toBeCloseTo(5)
      
      // Velocitat al periastre v = sqrt(MU * (2/r - 1/a))
      const expectedV = Math.sqrt(MU * (2 / 5 - 1 / 10))
      expect(state.velocity.z).toBeCloseTo(expectedV)
    })
  })

  describe('getStateAtAnomaly', () => {
    it('coincideix amb getInitialState quan l\'anomalia és 0 (el satèl·lit es troba al periastre)', () => {
      const a = 8
      const e = 0.2
      const theta = 0 // 0 radians = inici del cicle
      
      const stateInit = getInitialState(a, e)
      const stateAnomaly = getStateAtAnomaly(a, e, theta)
      
      expect(stateAnomaly.pos.x).toBeCloseTo(stateInit.position.x)
      expect(stateAnomaly.pos.z).toBeCloseTo(stateInit.position.z)
      expect(stateAnomaly.vel.x).toBeCloseTo(stateInit.velocity.x)
      expect(stateAnomaly.vel.z).toBeCloseTo(stateInit.velocity.z)
    })
  })

  describe('Integració Numèrica (updateRK4)', () => {
    it('integra un pas de temps de forma coherent amb la gravetat (caiguda lliure)', () => {
      const pos = new Vector3(10, 0, 0)
      const vel = new Vector3(0, 0, 1) // Velocitat lenta cap endavant
      const dt = 0.1
      
      updateRK4(pos, vel, dt)
      
      // Com la gravetat estira el cos cap a l'origen (x = 0), l'acceleració serà negativa a l'eix X.
      // Això vol dir que la velocitat X hauria de passar de 0 a un valor negatiu,
      // i la posició X hauria de ser lleugerament inferior a 10.
      expect(vel.x).toBeLessThan(0)
      expect(pos.x).toBeLessThan(10)
      
      // Com teníem velocitat Z positiva, la posició Z ha d'haver augmentat
      expect(pos.z).toBeGreaterThan(0)
    })
  })
})