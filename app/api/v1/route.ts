import { json } from "@/lib/api/http";

export const dynamic = "force-dynamic";

// Private API for Jaime's own agents. The contract for content is AGENTS.md.
const index = {
  name: "jaime-palantir",
  version: 1,
  auth: "Authorization: Bearer $PORTFOLIO_API_TOKEN (every route)",
  contract: "AGENTS.md",
  sourceOfTruth: ["content/person.json", "content/site.json", "content/projects/<id>.json", "content/index.json", "content/techs.json"],
  spec: "/api/v1/openapi.json",
  note: "Writes go to disk only when running locally. Publishing is a commit of content/ and public/ plus a deploy.",
};

export function GET() {
  return json(index);
}
