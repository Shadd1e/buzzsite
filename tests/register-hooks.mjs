/**
 * Lets Node's built-in test runner load the app's TypeScript directly:
 * resolves the tsconfig aliases (@/…, @test-data/…), extensionless imports,
 * and JSON fixtures imported without `with { type: "json" }`.
 * Node 24 strips the TypeScript types itself; no extra packages needed.
 */
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const aliases = [
  ["@/", path.join(root, "src") + path.sep],
  ["@test-data/", path.join(root, "test-data") + path.sep],
];

function withExtension(file) {
  if (existsSync(file) && !file.endsWith(path.sep) && path.extname(file)) return file;
  for (const ext of [".ts", ".tsx", "/index.ts"]) if (existsSync(file + ext)) return file + ext;
  return file;
}

registerHooks({
  resolve(specifier, context, next) {
    for (const [prefix, dir] of aliases) {
      if (specifier.startsWith(prefix)) {
        return { url: pathToFileURL(withExtension(dir + specifier.slice(prefix.length))).href, shortCircuit: true };
      }
    }
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
      const file = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
      return { url: pathToFileURL(withExtension(file)).href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".json")) {
      return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
    }
    if (url.endsWith(".ts")) {
      return { format: "module-typescript", source: readFileSync(fileURLToPath(url), "utf8"), shortCircuit: true };
    }
    return next(url, context);
  },
});
