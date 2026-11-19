import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves DESIGN.md as plain text so /dev/components can link each § tag to
 * its section with a text fragment (#:~:text=…). Dev tooling only.
 */
export async function GET() {
  const text = await readFile(path.join(process.cwd(), "..", "DESIGN.md"), "utf8");
  return new Response(text, {
    headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
  });
}
