import type { Identity } from "#shared/identity.type.ts";
import type { CommandResult } from "#shared/output/command.contract.ts";
import { renderView } from "#shared/output/view.render.ts";
import type { ViewField } from "#shared/output/view.contract.ts";

type ProjectTechnology = { name: string; type: string; technologies: readonly string[] };
const technologies = ["TypeScript 7", "Node.js 26", "npm 12", "Vite+", "Vitest"];
const projects: readonly ProjectTechnology[] = [
  {
    name: "cli",
    type: "cli",
    technologies: [...technologies, "@vitest/coverage-v8", "@types/node", "No framework"],
  },
  { name: "e2e", type: "e2e", technologies: [...technologies, "@types/node", "No framework"] },
];
const fields: readonly ViewField[] = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "version", label: "Version" },
  { key: "author", label: "Author" },
  ...projects.map((project) => ({ key: project.name, label: project.name })),
];

export function aboutResult(identity: Identity): CommandResult {
  const projectFacts = projects.map((project) => [
    project.name,
    `${project.name} (${project.type}); ${project.technologies.join(", ")}`,
  ]);
  const view = renderView({
    kind: "record",
    fields,
    record: {
      name: identity.displayName,
      description: identity.description,
      version: identity.version,
      author: `${identity.author.name} (${identity.author.url})`,
      ...Object.fromEntries(projectFacts),
    },
  });
  return {
    text: view.text,
    json: {
      name: identity.displayName,
      description: identity.description,
      version: identity.version,
      author: identity.author,
      projects,
    },
  };
}
