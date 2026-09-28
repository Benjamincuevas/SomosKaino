# ServiNet — Plan de negocio y producto

> Plataforma para pedir cualquier servicio del hogar o de negocio en República Dominicana:
> plomeros, electricistas, albañiles, herreros, maestros constructores, ingenieros y más.

---

## 1. Mi opinión sincera: ¿vale la pena?

**Sí, pero no como "otro directorio de técnicos".** La necesidad es real y constante (todo el mundo
necesita un plomero o un electricista confiable). El problema es que **ya hay varios intentando lo mismo en RD**,
así que ServiNet solo gana si ataca el problema de fondo mejor que ellos: **la confianza** y **la rapidez**.

La ventaja que tú tienes y ellos probablemente no: **ya construiste un agente de IA para WhatsApp (SomosKaino)**.
En RD todo pasa por WhatsApp. Un ServiNet donde el cliente pide el servicio escribiendo o mandando un audio y una
foto por WhatsApp, sin descargar ninguna app, es una ventaja difícil de copiar.

---

## 2. Pros y contras

### ✅ Pros
| | |
|---|---|
| **Demanda constante** | Averías, remodelaciones y mantenimiento nunca paran. No depende de modas. |
| **Mercado muy informal** | Hoy se consigue técnico "por referencia de un vecino". Eso es exactamente lo que se puede ordenar. |
| **Doble público** | Clientes que buscan confianza y técnicos que buscan más trabajo. Ambos ganan. |
| **Crecimiento de la construcción** | Remodelaciones, torres, Airbnb, zonas turísticas (Punta Cana, Bávaro, Las Terrenas) necesitan mano de obra. |
| **Clientes recurrentes (B2B)** | Negocios, colmados, restaurantes, administradores de edificios y Airbnb necesitan mantenimiento todos los meses. |
| **Tu ventaja técnica** | Ya dominas Next.js + Supabase + WhatsApp + IA. Reutilizas mucho de SomosKaino. |

### ❌ Contras y riesgos
| Riesgo | Cómo mitigarlo |
|---|---|
| **Competencia existente** (ManoRapido, Resuelve, Contrata.com, Pimer, Gemfix) | Diferenciarte en WhatsApp + IA, verificación seria y el segmento de negocios (ver sección 4). |
| **"El huevo y la gallina"** — sin técnicos no hay clientes, sin clientes no hay técnicos | Empezar **solo en una ciudad y con 4–5 oficios**. Reclutar técnicos primero, a mano. |
| **Desintermediación** — cliente y técnico se pasan el número y ya no te usan | Cobrar por el contacto/lead (no por comisión del trabajo) y dar valor que se pierde fuera: reseñas, garantía, historial. |
| **Calidad y confianza** — un mal técnico daña la marca | Verificación (cédula + certificado de no antecedentes + referencias), reseñas solo de trabajos reales, suspensión rápida. |
| **Pagos en efectivo** | Al inicio, no tocar el dinero del trabajo. Más adelante, pago protegido opcional. |
| **Técnicos poco digitales** | Todo debe funcionar desde WhatsApp y un teléfono sencillo. Nada de formularios largos. |
| **Nombre "ServiNet" ya en uso** — existe un *ServiNet* de reparación de TVs y laptops en Santo Domingo | Verificar en **ONAPI** antes de invertir en marca; considerar variante (ej. *ServiNet RD*, *ServiNet Pro*). |

---

## 3. Análisis del mercado

**Cómo contrata hoy la gente en RD:** recomendaciones de familiares/vecinos, grupos de Facebook y WhatsApp,
y el técnico de confianza "de siempre". Los dolores más comunes:

1. **No sé si es confiable** (que entre a mi casa, que no me robe, que haga bien el trabajo).
2. **No sé cuánto cobrar/pagar** — los precios varían muchísimo.
3. **No llega o no contesta** — la puntualidad es el reclamo número uno.
4. **No hay garantía** — si se vuelve a dañar, el técnico desaparece.

**Competidores identificados:**
- [ManoRapido](https://www.manorapido.com/do) — profesionales del hogar en varios países de Latinoamérica, incluida RD.
- [Resuelve](https://resuelvedr.com/servicios/) — servicios a domicilio con gente verificada y precio acordado antes.
- [Contrata.com](https://contrata.com/contratar/plomeros/santo-domingo) — directorio de empresas y técnicos independientes.
- [Pimer](https://pimer.app/) — app de mantenimiento para hogar y negocio.
- Gemfix (app) — plomería, electricidad, albañilería y reparaciones.

**Conclusión:** el mercado está validado (hay gente intentándolo), pero nadie es dominante. Eso es bueno:
todavía se puede ganar con mejor ejecución.

---

## 4. Cómo sacarle ventaja a la competencia

1. **WhatsApp primero, con IA** *(tu arma principal)*
   El cliente escribe "se me dañó el inversor" o manda un audio con una foto. El agente de IA entiende el
   problema, lo clasifica, pregunta lo que falta (sector, urgencia) y publica la solicitud. Los técnicos reciben
   el aviso también por WhatsApp y cotizan respondiendo. Se reutiliza el webhook y el agente de SomosKaino.

2. **Verificación seria y visible**
   Insignia de verificado solo con cédula, **certificado de no antecedentes penales** de la Procuraduría y dos
   referencias. Mostrar "Verificado por ServiNet" como sello de calidad.

3. **Garantía ServiNet**
   Si el trabajo falla en 30 días, el mismo técnico vuelve sin costo o ServiNet asigna otro. Al principio
   se puede sostener con los técnicos que acepten ese compromiso (técnicos "Garantizados").

4. **Precios de referencia**
   Mostrar un rango típico por servicio ("destapar un inodoro: RD$1,500 – RD$3,000"), alimentado con las
   propias cotizaciones de la plataforma. Esto elimina el miedo a que te cobren de más.

5. **Segmento de negocios (B2B)** — lo que la competencia atiende menos
   - Planes de **mantenimiento mensual** para colmados, restaurantes, oficinas, condominios y Airbnb.
   - Proyectos grandes con **maestros constructores e ingenieros** (con CODIA), con cotización formal y
     **comprobante fiscal (NCF)**.
   - Un solo contacto para todo: un negocio no quiere buscar 5 técnicos distintos.

6. **Especialidades con demanda local**: plantas eléctricas, inversores y paneles solares, cisternas y bombas,
   aires acondicionados. Son problemas muy dominicanos que las plataformas genéricas no destacan.

---

## 5. Modelo de negocio (cómo ganar dinero)

| Fase | Modelo | Por qué |
|---|---|---|
| **Lanzamiento (0–6 meses)** | Gratis para todos | Hay que llenar la plataforma de técnicos y generar reseñas. |
| **Crecimiento** | **Créditos por cotización** (el técnico paga un poco por cotizar un trabajo, ej. RD$100–300 según el tamaño) | No depende de que el pago pase por la plataforma, así que la desintermediación no te quita ingresos. |
| **Crecimiento** | **Plan Pro para técnicos** (mensual): aparece primero, insignia, cotizaciones ilimitadas | Ingreso recurrente y predecible. |
| **Madurez** | **Contratos B2B** de mantenimiento con margen | El ingreso más estable y alto por cliente. |
| **Madurez** | **Pago protegido** opcional (el dinero se libera al terminar) con comisión pequeña | Da seguridad al cliente; ingreso extra. |

> Recomendación: **no empezar cobrando comisión por trabajo**. En un mercado de efectivo, es muy fácil que
> cliente y técnico acuerden por fuera. Cobrar por el acceso al cliente es más realista.

---

## 6. Cómo arrancar (estrategia de lanzamiento)

1. **Una ciudad**: Santiago o el Distrito Nacional (la que mejor conozcas y donde tengas contactos).
2. **Cinco oficios al inicio**: plomería, electricidad, aires acondicionados, albañilería y pintura.
3. **Reclutar 30–50 técnicos a mano antes de abrir a clientes**: ferreterías, grupos de WhatsApp de técnicos,
   INFOTEP, referidos. Verificarlos personalmente al principio.
4. **Primeros clientes**: tu círculo, grupos de Facebook del sector, administradores de edificios, anfitriones de Airbnb.
5. **Medir todo** (ver sección 8) y hablar con cada cliente y técnico las primeras semanas.
6. Cuando una ciudad funcione (clientes que repiten, técnicos que responden rápido), pasar a la siguiente.

---

## 7. Plan de producto por fases

### Fase 1 — MVP ✅ *(construido en este repositorio)*
- Registro de clientes y profesionales (con teléfono de WhatsApp y ciudad).
- 17 categorías de servicio (hogar, construcción y negocios) y 12 ciudades de RD.
- El cliente publica una solicitud: servicio, descripción, ciudad/sector, urgencia y presupuesto opcional.
- El profesional ve los trabajos de sus oficios y ciudades y envía cotizaciones (precio, mensaje, fecha).
- El cliente compara cotizaciones con calificación y trabajos realizados, y acepta una.
- **El teléfono solo se revela al aceptar**; botón directo a WhatsApp.
- El cliente marca el trabajo como completado y deja una reseña (solo trabajos reales).
- Perfil público del profesional con reseñas.
- Seguridad a nivel de base de datos (RLS): cada quien ve solo lo que le corresponde.

### Fase 2 — Confianza y WhatsApp
- ✅ Fotos en la solicitud (hasta 5, privadas).
- ✅ Verificación de profesionales (cédula + certificado de no antecedentes + referencias) y panel de administración para aprobarlos.
- Portafolio de fotos en el perfil del profesional.
- **Agente de IA por WhatsApp** (reutilizando SomosKaino): pedir servicios por chat/audio y avisar a técnicos.
- Notificaciones por WhatsApp y correo cuando llega una cotización o te aceptan.

### Fase 3 — Monetización
- Créditos por cotización y Plan Pro (Stripe o pasarela local como Azul / CardNet).
- Precios de referencia por servicio.
- Garantía ServiNet.

### Fase 4 — Negocios y escala
- Cuentas de empresa: varias sucursales, planes de mantenimiento recurrentes, facturas con NCF.
- Proyectos grandes con etapas (maestro constructor / ingeniero).
- Pago protegido.
- App móvil (PWA primero).

---

## 8. Métricas que importan

- **Tiempo hasta la primera cotización** (meta: menos de 2 horas en horario laboral).
- **% de solicitudes con al menos 1 cotización** (meta: > 80 %).
- **% de solicitudes que terminan asignadas.**
- **Calificación promedio** y % de trabajos con reseña.
- **Clientes que repiten** en 90 días.
- **Técnicos activos** por oficio y ciudad (que coticen al menos una vez por semana).

---

## 9. Aspectos legales en RD

- Registrar el nombre comercial en **ONAPI** y constituir la empresa (SRL) con su **RNC** en la DGII.
- Términos y condiciones claros: ServiNet conecta, el trabajo es responsabilidad del profesional
  (hasta que exista la garantía o el pago protegido).
- Política de privacidad conforme a la **Ley 172-13** de protección de datos personales.
- Para ingenieros y arquitectos: verificar su registro en el **CODIA**.

---

## 10. Costos iniciales aproximados

| Concepto | Costo |
|---|---|
| Supabase (base de datos y autenticación) | Gratis al inicio; plan Pro ≈ US$25/mes |
| Vercel (hosting) | Gratis al inicio; Pro ≈ US$20/mes |
| Dominio (.com o .com.do) | ≈ US$15–50/año |
| WhatsApp Business API | Pago por conversación (según tarifas de Meta) |
| Registro ONAPI + constitución de empresa | Variable (consultar con un abogado/contador) |
| Marketing inicial (Facebook/Instagram, volantes en ferreterías) | Según presupuesto |

> Los precios de servicios en la nube cambian; confírmalos en la página de cada proveedor antes de presupuestar.
