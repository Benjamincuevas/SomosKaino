# ServiNet

**Pide cualquier servicio para tu hogar o negocio en República Dominicana.**
Plomeros, electricistas, albañiles, herreros, maestros constructores, ingenieros y más.
Publicas lo que necesitas, recibes cotizaciones de profesionales de tu zona y eliges.

📄 Plan de negocio completo (pros y contras, mercado, competencia, modelo de negocio y roadmap): [`docs/PLAN.md`](docs/PLAN.md)

> El CRM con IA para WhatsApp que vivía antes en este repositorio se conserva en la rama `main`
> (commit `d2228c3`) y se moverá a su propio repositorio, `SomosKaino-CRM`.

## Cómo funciona

1. **El cliente** publica una solicitud: servicio, descripción, ciudad, urgencia y presupuesto opcional.
2. **Los profesionales** de ese oficio la ven en su panel y envían cotizaciones (precio, mensaje, fecha).
3. **El cliente** compara (calificación, trabajos hechos, verificado) y acepta una.
4. Se revelan los teléfonos y coordinan por **WhatsApp**.
5. Al terminar, el cliente marca el trabajo como completado y deja una **reseña**.

## Administración y verificación

- El correo que está en la tabla `admin_emails` se convierte en **administrador** al confirmar su cuenta.
  Para añadir otro administrador: `insert into public.admin_emails (email) values ('correo@ejemplo.com');`
- Los profesionales suben su **cédula** y su **certificado de no antecedentes** desde "Mi perfil".
  Quedan en un bucket privado que solo ven ellos y el administrador.
- En `/admin` el administrador ve las métricas, abre los documentos, escribe al profesional por WhatsApp y **aprueba o rechaza**.
  Al aprobarlo, el profesional recibe la insignia ✔ Verificado.
- Los clientes pueden añadir hasta **5 fotos** a cada solicitud. Solo las ven el cliente y los profesionales que pueden ver esa solicitud.

## Stack

- **Next.js 14** (App Router, Server Actions) + TypeScript + Tailwind CSS
- **Supabase**: PostgreSQL, autenticación y seguridad por filas (RLS)

## Puesta en marcha

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En el **SQL Editor** de Supabase, ejecuta en orden los archivos de `supabase/migrations/`.
3. Copia `.env.example` a `.env.local` y rellena la URL y la *anon key* del proyecto
   (Supabase → Project Settings → API).
4. Instala y arranca:

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

> Para probar rápido, en Supabase → Authentication → Providers → Email puedes desactivar
> "Confirm email" y así entrar justo después de registrarte.

## Estructura

```
app/
  page.tsx                 Landing con categorías
  (auth)/login, registro   Entrar y crear cuenta (cliente o profesional)
  solicitar/               Formulario para pedir un servicio
  panel/                   Panel: solicitudes del cliente / trabajos y cotizaciones del profesional
  solicitudes/[id]/        Detalle: cotizar, aceptar, completar y reseñar
  perfil/                  Perfil del profesional (oficios, ciudades, experiencia, verificación)
  admin/                   Panel de administración (métricas y verificaciones)
  profesionales/[id]/      Perfil público con reseñas
  actions.ts               Server actions
lib/catalog.ts             Categorías, ciudades y utilidades (RD$, enlaces de WhatsApp)
supabase/migrations/       Esquema, funciones y políticas de seguridad
docs/PLAN.md               Plan de negocio y roadmap
```

## Seguridad

Todas las reglas viven en la base de datos (RLS), no solo en la interfaz:

- Un profesional solo ve solicitudes abiertas de sus oficios.
- Solo el cliente dueño ve las cotizaciones de su solicitud; cada profesional ve solo la suya.
- El teléfono solo lo ven las dos partes de un trabajo aceptado.
- Nadie puede registrarse como admin, cambiar su rol ni marcarse como verificado.
- Aceptar, completar y cancelar pasan por funciones que validan el estado.
- Solo el cliente de un trabajo completado puede reseñar, y solo al profesional que lo hizo.
