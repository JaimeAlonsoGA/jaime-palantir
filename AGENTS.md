# jaime-palantir

Portfolio de Jaime Alonso. Este archivo es el contrato. Léelo antes de editar nada.

Las páginas ya están: `/`, `/projects`, `/projects/<id>`, `/stack`, `/contact` y `/cv`. `/contact#work` abre la tarjeta de contacto girada, con los proyectos destacados. No rehagas la interfaz salvo que Jaime lo pida.

## Qué es verdad

Los archivos de `content/` y `public/` son el portfolio. La web y la API los leen. No hay base de datos.

| Qué | Dónde |
| --- | --- |
| Quién es Jaime | `content/person.json` |
| Textos que aún pinta la interfaz actual | `content/site.json` |
| Un proyecto | `content/projects/<id>.json` |
| Orden y cuántos salen en "Featured work" (`/contact`) | `content/index.json` (`projectIds`, `lead`) |
| Catálogo de tecnologías | `content/techs.json` |
| Imágenes | `public/images/` |
| Forma de esos datos | `lib/content/schema.ts` |

Un proyecto con `status: "draft"` o `"archived"` no sale en la web pública. Borrar por API archiva: el proyecto sigue en el JSON.

No hay campo de disponibilidad. Jaime está abierto a ofertas aunque esté trabajando. `workArrangement` dice cómo trabaja (hoy "Freelance"), no si está disponible.

## Cómo se actualiza

`content/person.json` es el CV y la fuente de verdad del perfil: nombre, rol (`Software Developer`), ubicación, forma de trabajo, frase (`headline`), enlaces, experiencia, skills, formación e idiomas. Las fechas de experiencia van en `YYYY-MM`; `end: null` es el puesto actual.

Design system: `components/ui/surface.tsx` (`PageShell`, `Panel`, `GradientPanel`, `AccentLine`, `Eyebrow`, `Chip`, `PillLink`), más `components/link-icon.tsx` y `components/facts.tsx`. Contact, CV y Stack se construyen solo con estas piezas; una página nueva también. No metas estilos sueltos que repitan una pieza existente.

Color con significado (`components/ui/palette.ts`), sacado de los CTAs del hero, que no se tocan: cálido (amarillo→rojo, "See all projects") = proyectos; frío (cian→azul, "All technologies") = tecnologías, CV y Stack; la mezcla de los dos = Contact. Un degradado nuevo sale de aquí, no de clases sueltas. Los iconos de perfiles son siempre los de `ProfileLinks` (header de Contact, footer): se aprenden una vez.

La imagen para compartir (`/opengraph-image`, `/twitter-image`) se genera en el build desde `content/` (`lib/seo/og-card.tsx`): nombre, rol, ciudad, forma de trabajo, la frase del hero, skills y el dominio. Nunca nombres de proyectos.

SEO: los metadatos, `sitemap.xml`, `robots.txt`, la imagen Open Graph y el JSON-LD (`lib/seo`) salen de `content/`. `site.siteUrl` es el dominio canónico: cámbialo si cambia el dominio.

Regla de interfaz: la UI no explica nada con texto, tiene que entenderse sola. Si hay texto, es corto, como un título. Nada de párrafos de introducción.

Tono: concreto, humano y en inglés sencillo. Sin "cutting-edge", "passionate", "seamless", "leverage", "empower" ni rayas largas. Sin cifras, usuarios ni impacto que no se puedan demostrar. En experiencia solo van Welloop AB y MIRTO; el resto son proyectos propios.

La frase de la home es `site.heroTagline`. Jaime eligió su frase original a propósito: es la única excepción a las reglas de tono, no la cambies sin que lo pida. `person.headline` es el resumen del CV y sale en el CV y los metadatos.

`/stack` agrupa por `category` de `techs.json` (orden de tarjetas en `app/stack/page.tsx`; sin categoría es "Other") y lista cada tecnología de `techs.json` que aparece en algún proyecto publicado, con enlaces `@id` a esos proyectos. Una tecnología sin proyecto no sale.

Los grupos de `skills` son los badges de la home. Los iconos y colores de cada skill están en `components/skill-icons.tsx` (Simple Icons y Lucide vía react-icons); un skill sin icono sale solo con el texto.

El id de un proyecto es el nombre del archivo: `content/projects/sona.json` es `sona`. El orden de `projectIds` es el orden de importancia. `lead` dice cuántos de los primeros publicados salen como "Featured work" en `/contact`. Hoy es 4.

Un proyecto es una frase (`summary`), su tipo (`kind`: "App", "Web", "Tool", "Plugin", "CLI" o "Hardware"), su año (`year`, opcional: si no se sabe, no se pone), el stack, los enlaces y las imágenes. No hay página de detalle: al pulsar un proyecto se abre dentro de la rejilla (ancho completo, visor de imágenes y vídeo, stack y enlaces), y la URL pasa a `/projects/<id>`; esa URL, al cargarse, pinta la misma rejilla con el proyecto abierto. Projects y Stack comparten los filtros por `kind` (`components/kind-filter.tsx`), y `?kind=` viaja entre las dos. `/projects` es una rejilla bento: los `lead` primeros van grandes y `kind` da los filtros (`?kind=` en la URL). La primera imagen decide cómo se pinta: vertical = capturas de móvil en fila, horizontal = portada a sangre. El stack no es un enum: cada valor es un `id` de `content/techs.json`. Las tecnologías salen siempre en el mismo orden: por categoría (`lib/content/stack-order.ts`) y, dentro de cada una, en el orden de `techs.json`; `readPortfolio` lo aplica, así que da igual cómo lo liste el archivo. En las tarjetas, lo que no cabe se resume en "+N". Las imágenes se suben como WebP, máximo 1920 px; las capturas de pantalla completa se pintan dentro de una ventana (`components/screen-frame.tsx`) y las de móvil ya traen su marco.

`/cv` es el CV para leer o imprimir y `/cv.txt` el mismo CV en texto. `/llms.txt` (formato llmstxt.org) es la puerta para agentes externos: quién es Jaime en dos líneas y enlaces absolutos a CV, contacto, stack y cada proyecto. Todo sale de estos archivos.

La API (`/api/v1`) es privada, para los agentes de Jaime: toda petición, lectura o escritura, lleva `Authorization: Bearer $PORTFOLIO_API_TOKEN` (en `.env.local`, plantilla en `.env.example`). La comprueba `middleware.ts`, un solo punto para todas las rutas; sin token configurado la API se apaga (503). El índice está en `GET /api/v1` y la especificación en `GET /api/v1/openapi.json`. `PUT /api/v1/profile` reemplaza `content/person.json`; la API escribe solo el archivo del cambio. `PUT /api/v1/projects/order` escribe el orden y, si viene `lead`, cuántos de los primeros publicados salen en Featured work y en grande en `/projects`. Un agente también puede editar los JSON directamente.

Las páginas se generan en el build (estáticas). Tras cada escritura, la API llama a `refreshPages()` (`lib/api/revalidate.ts`) para que la siguiente visita lea los archivos nuevos.

En local, la API escribe en disco. En Vercel el disco no guarda escrituras. Publicar es un commit de esos archivos y un despliegue. No añadas una base de datos para esto.

## Tecnología

Next.js 15 y React 19, que es lo que ya sirve `https://jaime360.vercel.app`. El contrato de contenido no depende de la interfaz: cuando se rehaga la UI, estos archivos siguen siendo la fuente.

## Comprobar

Dependencias con pnpm (`pnpm install`; `pnpm-lock.yaml` es el único lockfile). No añadas librerías para lo que el código ya resuelve: las animaciones son CSS y `components/use-flip.ts`.

```bash
npm test
npm run typecheck
npm run build
```

Los tres tienen que pasar. `npm run dev` sirve `http://localhost:3000`. Si Jaime tiene `next dev` abierto, un agente compila y sirve su copia con `NEXT_DIST_DIR=.next-agent` para no pisarle `.next`.

Animaciones de la home: CSS (`enter-*` en `app/globals.css`), en orden de lectura: nombre, frase, skills, botones y header. Los tiempos están en `timing` de `components/hero.tsx`. Solo `opacity` y `transform`. El nombre no empieza en opacidad 0 ni con texto transparente, porque es el LCP.

## Lo que leen agentes y buscadores

Público y sin token: las páginas, `GET /llms.txt`, `GET /cv.txt`, `GET /sitemap.xml`, `GET /robots.txt` y la imagen para compartir. Cada página lleva datos estructurados (schema.org, `lib/seo`): la persona y la web en todas, `ProfilePage` en inicio, CV y contacto, y cada proyecto como `CreativeWork`. `robots.txt` cierra `/api/`.

## Qué no hacer

No hagas push ni despliegues hasta que Jaime lo pida. La rama de trabajo es local. Producción sigue en `main`.
