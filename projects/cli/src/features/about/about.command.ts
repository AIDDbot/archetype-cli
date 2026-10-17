import { identity } from "../../shared/identity.ts";
import { ExpectedError } from "../../shared/errors/expected.error.ts";
import type { CommandRegistration } from "../../shared/output/command.type.ts";

const technologies = [
  "TypeScript 7",
  "Node.js",
  "Node.js standard library",
  "framework-free",
  "Vite+",
  "Vitest",
] as const;
const projects = [
  { name: "cli", type: "cli", technologies },
  { name: "e2e", type: "e2e", technologies },
] as const;

export function registerAbout(): CommandRegistration {
  return {
    name: "about",
    summary: "Show application identity and technology",
    usage: "about [options]",
    operations: [],
    options: [],
    async run(args) {
      if (args.length > 0) throw new ExpectedError("usage", "Use about [options]");
      const { name, description, version, author, website: homepage } = identity;
      const data = { name, description, version, author, homepage, projects };
      const facts = [
        { label: "Name", value: name },
        { label: "Description", value: description },
        { label: "Version", value: version },
        { label: "Author", value: author },
        { label: "Homepage", value: homepage },
        ...projects.map((project) => ({
          label: `${project.name} (${project.type})`,
          value: { items: project.technologies },
        })),
      ];
      return { data, view: { kind: "record", facts } };
    },
  };
}
