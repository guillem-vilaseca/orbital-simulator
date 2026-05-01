# Fonaments de Mecànica Orbital

Aquest document detalla els principis físics i matemàtics que regeixen el moviment dels satèl·lits del simulador, així com l'estratègia del càlcul numèric utilitzat per la renderització a temps real.

---

## 1. El Problema dels Dos Cossos

La simulació es basa en el **Problema dels Dos Cossos** mecànica clàssica, que assumeix que un cos de massa petita (el satèl·lit, $m$) orbita al voltant d'un cos de massa masiva (la Terra, $M$), y que ambdos son esfèricament simètrics.

Partim de la **Lley de Gravitació Universal de Newton**:

$$\vec{F} = -G \frac{M m}{r^2} \hat{u}_r$$

On:
* $G$ és la constant de gravitació universal.
* $r$ és la distància entre els centres de massa.
* $\hat{u}_r$ és el vector unitari que apunta de la Terra al satèl·lit.

Aplicant la Segona Lley de Newton ($\vec{F} = m \vec{a}$), podem cancel·lar la massa del satèlit ($m$) i definir el **paràmetre gravitacional estàndard** ($\mu= G \cdot M$). Això ens dona l'equació diferencial fonamental del moviment orbital:

$$\ddot{\vec{r}} = -\frac{\mu}{r^3}\vec{r}$$

Aquesta equació ens diu que l'acceleració  ($\ddot{\vec{r}}$) d'un satèl·lit en qualsevol punt de l'espai depen únicament de la seva posició actual ($\vec{r}$) respecte el centre del planeta.

---

## 2. Elements Orbitals Keplerians

Tot i que la física del motor funciona amb vectors cartesians tridimensionals (Posició $\vec{r}$ i Velocitat $\vec{v}$), les òrbites es descriuen comunment utilitzant 6 paràmetres clàssics, coneguts com **Elements Keplerians**.

Aquests defineixen unívocament la mida, forma i orientació espacial de l'òrbita:

1. **Excentricitat** de l'òrbita ($e$): forma de la òrbita.
    * $e = 0$: Circular
    * $0 < e < 1$: El·líptica
    * $e \ge 1$: Parabòlica / Hiperbòlica (trajectes d'escapada)
2. **Semieix major ($a$)**: Defineix la mida de l'òrbita. És la meitat de l'eix més llarg de l'el·lipse.
3. **Inclinació ($i$)**: L'angle d'inclinació del plà orbital respecte al plà de referència del cos central.
4. **Longitud del Node Ascendent ($\Omega$):**  L'angle horitzontal que indica on l'orbita es creua l'equador de sur a nort
5. **Argument del Periheli ($\omega$):** L'angle en el plà orbital que defineix l'orientació de l'el·lipse (on està el punt més proper al planeta)
6. **Anomalia mitjana de l'època ($\nu$):** L'angle que defineix la posició exacta del satèl·lit dins de l'orbita en un instant de temps específic.

---

## 3. Integració Numèrica

Per animar el satèl·lit de la pantalla, necessitem preveure la seva posició en el següent *frame* computacional. És a dirt, necessitem resoldre l'equació diferencial $\ddot{\vec{r}} = -\frac{\mu}{r^3}\vec{r}$ en intervals de temps petits ($\Delta t$).

### Runge-Kutta de 4t Ordre (RK4)

Per garantitzar l'estabilitat orbital a llarg termini, el simulador utilitza l'integrador numèric **RK4**. Aquest mètode evalua les derivades en quatre punts diferents dins de l'interval $\Delta t$ per calcular un pendent mitjà:

* $k_1$: Pendent a l'inici de l'interval.
* $k_2$: Pendent en el punt mig (utilitzant $k_1$).
* $k_3$: Pendent en el punt mig (utilitzant $k_2$).
* $k_4$: Pendent al final de l'interval (utilitzant $k_3$).
