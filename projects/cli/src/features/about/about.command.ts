import { ExpectedError } from "#shared/expected.error.ts";
import type { CommandRegistration, FeatureContext } from "#shared/output/command.type.ts";

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

export function registerAbout({ identity }: FeatureContext): CommandRegistration {
  return {
    name: "about",
    summary: "Show application identity and technology",
    usage: "about [options]",
    operations: [],
    options: [],
    async run(args) {
      const hasArguments = args.length > 0;
      if (hasArguments) throw new ExpectedError("usage", "Use about [options]");
      const { displayName: name, description, version, author } = identity;
      const data = { name, description, version, author, projects };
      const facts = [
        { label: "Name", value: name },
        { label: "Description", value: description },
        { label: "Version", value: version },
        { label: "Author", value: author.name },
        { label: "Website", value: author.url },
        ...projects.map((project) => ({
          label: `${project.name} (${project.type})`,
          value: { items: project.technologies },
        })),
      ];
      return { data, view: { kind: "record", facts } };
    },
  };
}
