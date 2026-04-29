import { Vector3 } from "three";

// Constant gravitacional simplificada per a la simulació
export const MU = 10;

/**
 * Calcula l'acceleració gravitatòria en una posició donada.
 * Utilitza la llei de gravitació universal simplificada: a = -MU / r^3
 * @param position - Vector de posició en l'espai
 * @returns Vector d'acceleració gravitatòria
 */
function getAcceleration(position: Vector3): Vector3 {
    const r = position.length();
    if (r === 0) return new Vector3(0, 0, 0);

    return position.clone().multiplyScalar(-MU / Math.pow(r, 3));
}

/**
 * Actualitza la posició i velocitat d'un satèl·lit usant el mètode de Runge-Kutta de 4t ordre.
 * Aquest mètode proporciona una integració numèrica més precisa que Euler.
 * @param position - Vector de posició (s'actualitza in-place)
 * @param velocity - Vector de velocitat (s'actualitza in-place)
 * @param dt - Pas de temps de la simulació
 */
export function updateRK4(position: Vector3, velocity: Vector3, dt: number) {
    // Càlcul dels 4 punts intermedis del mètode RK4
    const v1 = velocity.clone();
    const a1 = getAcceleration(position);

    const p2 = position.clone().add(v1.clone().multiplyScalar(dt / 2));
    const v2 = velocity.clone().add(a1.clone().multiplyScalar(dt / 2));
    const a2 = getAcceleration(p2);

    const p3 = position.clone().add(v2.clone().multiplyScalar(dt / 2));
    const v3 = velocity.clone().add(a2.clone().multiplyScalar(dt / 2));
    const a3 = getAcceleration(p3);

    const p4 = position.clone().add(v3.clone().multiplyScalar(dt));
    const v4 = velocity.clone().add(a3.clone().multiplyScalar(dt));
    const a4 = getAcceleration(p4);

    // Combinació ponderada dels increments
    const dp = v1.add(v2.multiplyScalar(2)).add(v3.multiplyScalar(2)).add(v4).multiplyScalar(dt / 6);
    const dv = a1.add(a2.multiplyScalar(2)).add(a3.multiplyScalar(2)).add(a4).multiplyScalar(dt / 6);

    position.add(dp);
    velocity.add(dv);
}

/**
 * Calcula els vectors inicials de posició i velocitat per a una òrbita elíptica.
 * Comença sempre al periastre (punt més proper al planeta central).
 * @param semiMajorAxis - Semieix major de l'òrbita
 * @param eccentricity - Excentricitat de l'òrbita (0 = circular, <1 = elíptica)
 * @returns Objecte amb vectors de posició i velocitat inicial
 */
export function getInitialState(semiMajorAxis: number, eccentricity: number): { position: Vector3, velocity: Vector3 } {
    const r = semiMajorAxis * (1 - eccentricity);
    const v = r > 0 ? Math.sqrt(MU * (2 / r - 1 / semiMajorAxis)) : 0;

    return {
        position: new Vector3(r, 0, 0),
        velocity: new Vector3(0, 0, v)
    }
}

/**
 * Genera una llista de punts 3D que formen l'elipse orbital completa.
 * Aquests punts s'utilitzen per visualitzar la trajectòria de l'òrbita.
 * @param semiMajorAxis - Semieix major de l'elipse
 * @param eccentricity - Excentricitat de l'elipse
 * @param numPoints - Nombre de punts a generar (per defecte 100)
 * @returns Llista de vectors 3D que formen l'òrbita
 */
export function calculateOrbitPath(semiMajorAxis: number, eccentricity: number, numPoints: number = 100): Vector3[] {
    const points: Vector3[] = [];
    for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * 2 * Math.PI;
        const r = semiMajorAxis * (1 - Math.pow(eccentricity, 2)) / (1 + eccentricity * Math.cos(theta));
        points.push(new Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
    }
    return points;
}

/**
 * Calcula la posició i velocitat d'un satèl·lit en un punt específic de la seva òrbita.
 * Utilitza l'anomalia verdadera (angle theta mesurat des del periastre).
 * @param a - Semieix major de l'òrbita
 * @param e - Excentricitat de l'òrbita
 * @param theta - Anomalia verdadera en radians
 * @returns Objecte amb vectors de posició i velocitat
 */
export function getStateAtAnomaly(a: number, e: number, theta: number): { pos: Vector3, vel: Vector3 } {
  const p = a * (1 - e * e);
  const r = p / (1 + e * Math.cos(theta));

  const pos = new Vector3(
    r * Math.cos(theta),
    0,
    r * Math.sin(theta)
  );

  const h = Math.sqrt(MU * p);
  const vel = new Vector3(
    -(MU / h) * Math.sin(theta),
    0,
    (MU / h) * (e + Math.cos(theta))
  );

  return { pos, vel };
}