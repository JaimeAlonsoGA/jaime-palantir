# jaime-palantir

Portfolio de Jaime Alonso. Next.js 15 sirve las páginas y una API privada para sus agentes. El contenido vive en archivos, no en una base de datos.

Empieza por [AGENTS.md](AGENTS.md). Ahí está el contrato para Jaime y para un agente que llega sin contexto.

Producción sigue en `main` (`https://jaimealonso.dev`). Esta rama es local. No hagas push ni despliegues hasta que Jaime lo pida. La interfaz se rehace después; no la cambies en esta pasada.

La API escribe en disco solo en local. En Vercel eso no persiste. Publicar es commitear `content/` y `public/` y desplegar ese commit.

## Run

```bash
cp .env.example .env.local
# put a long random secret in PORTFOLIO_API_TOKEN (openssl rand -hex 32)
pnpm install
npm test
npm run dev
```

## Public

- `/llms.txt` — who Jaime is and where to read more, for agents (llmstxt.org)
- `/cv` and `/cv.txt` — the CV, as a page and as plain text
- `/sitemap.xml`, `/robots.txt`, `/opengraph-image`

## Private API

Every `/api/v1` request needs `Authorization: Bearer $PORTFOLIO_API_TOKEN`. Start at `GET /api/v1`; the spec is `GET /api/v1/openapi.json`. Add `?include=all` to see drafts and archived projects.

- `GET /api/v1/portfolio`, `/profile`, `/site`, `/projects`, `/projects/{id}`, `/techs`
- `PUT /api/v1/profile` and `PUT /api/v1/site` replace those objects
- `POST /api/v1/projects` creates one; `PATCH /api/v1/projects/{id}` updates it; `DELETE` archives it
- `PUT /api/v1/projects/order` with `{ "ids": [...], "lead": 4 }` sets display order and how many of the first published projects are featured
- `PUT /api/v1/techs` replaces the catalog; `PUT` or `DELETE /api/v1/techs/{id}` edits one
- `POST /api/v1/media` uploads `file` and returns a `/images/uploads/...` path

Quién es Jaime está en `content/person.json`. Un proyecto es `content/projects/<id>.json`. El id es el nombre del archivo. `stack` usa ids de `content/techs.json`. `/cv`, `/cv.txt` y `/llms.txt` salen de esos archivos. El orden y los proyectos destacados de `/contact` están en `content/index.json`. Icons for known technology ids stay in code; an unknown id still renders as a label.
