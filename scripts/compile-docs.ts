import { execFileSync } from "node:child_process";

const typedocArguments = [
  "typedoc",
  "--entryPoints",
  "hooks",
  "--entryPoints",
  "types",
  "--entryPoints",
  "lib",
  "--exclude",
  "**/env.d.ts",
  "--entryPointStrategy",
  "expand",
  "--plugin",
  "typedoc-plugin-markdown",
  "--hideGenerator",
  "--cleanOutputDir",
  "false",
  "--disableSources",
  "--intentionallyNotExported",
  "TypeMap",
  "--intentionallyNotExported",
  "GlobalOmitConfig",
  "--intentionallyNotExported",
  "TypeMapCb",
  "--skipErrorChecking",
];

/** Compiles TypeDoc into the requested destination. */
export function compileDocumentation(
  workspaceRoot: string,
  outputDirectory: string
): void {
  execFileSync("npx", [...typedocArguments, "--out", outputDirectory], {
    cwd: workspaceRoot,
    stdio: "inherit",
  });
}

if (require.main === module) {
  compileDocumentation(process.cwd(), "docs");
}
