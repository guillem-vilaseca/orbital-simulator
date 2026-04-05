import { Vector3 } from "three";

//Constant gravitacional estàndard, simplifacat per a aquest joc
export const MU = 10;

function getAcceleration(position: Vector3): Vector3 {
    const r = position.length(); //Distància al centre del planeta
    if(r=== 0) return new Vector3(0, 0, 0); //Evitem divisió per zero

    return position.clone().multiplyScalar(-MU / Math.pow(r,3)); //Aceleració gravitatòria
}

export function updateRK4(position: Vector3, velocity: Vector3, dt: number) {
    //K1
    const v1 = velocity.clone();
    const a1 = getAcceleration(position);

    //K2
    const p2 = position.clone().add(v1.clone().multiplyScalar(dt / 2));
    const v2 = velocity.clone().add(a1.clone().multiplyScalar(dt / 2));
    const a2 = getAcceleration(p2);

    //K3
    const p3 = position.clone().add(v2.clone().multiplyScalar(dt / 2));
    const v3 = velocity.clone().add(a2.clone().multiplyScalar(dt / 2));
    const a3 = getAcceleration(p3);

    //K4
    const p4 = position.clone().add(v3.clone().multiplyScalar(dt));
    const v4 = velocity.clone().add(a3.clone().multiplyScalar(dt));
    const a4 = getAcceleration(p4);

    //dp = (v1 + 2*v2 + 2*v3 + v4) * (dt / 6)
    const dp = v1.add(v2.multiplyScalar(2)).add(v3.multiplyScalar(2)).add(v4).multiplyScalar(dt / 6);
    //dv = (a1 + 2*a2 + 2*a3 + a4) * (dt / 6)
    const dv = a1.add(a2.multiplyScalar(2)).add(a3.multiplyScalar(2)).add(a4).multiplyScalar(dt / 6);

    position.add(dp);
    velocity.add(dv);
}

/*Calcula els vectors inicials de Posició i Velocitat basants en els elements Keplerians.
* Assumim que comencem al "Periastre" (punt més proper al planeta) 
*/

export function getInitialState(semiMajorAxis: number, eccentricity: number): { position: Vector3, velocity: Vector3 } {
    //Distància al periastre:
    const r = semiMajorAxis * (1 - eccentricity);

    //Velocitat usant l'equació de vis viva: v = sqrt(MU * (2/r - 1/a))
    const v = r > 0 ? Math.sqrt(MU * (2 / r - 1 / semiMajorAxis)) : 0;

    return {
        position: new Vector3(r, 0, 0), //Comencem al periastre
        velocity: new Vector3(0, 0, v) //Velocitat tangencial
    }
}

/**
 * Genera una llista de punts 3D que formen l'elipse orbital completa. Aquests ens serviran per dibuixar la línia de l'òrbita.
 * @param semiMajorAxis 
 * @param eccentricity 
 * @param numPoints 
 */

export function calculateOrbitPath(semiMajorAxis: number, eccentricity: number, numPoints: number = 100): Vector3[] {
    const points: Vector3[] = [];
    for(let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * 2 * Math.PI; //Angle al voltant de l'òrbita, en radians.

        //Equació paramètrica de l'elipse: r(θ) = a(1 - e^2) / (1 + e * cos(θ))
        const r = semiMajorAxis * (1 - Math.pow(eccentricity, 2)) / (1 + eccentricity * Math.cos(theta));

        // Convertir polar a cartesià (assumim que el focus està a l'origen i l'òrbita està en el pla XZ)
        points.push(new Vector3(r*Math.cos(theta),  0,  r*Math.sin(theta)));
    }
    return points;
}
