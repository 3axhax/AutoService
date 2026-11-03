import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const directory = await mkdtemp(join(tmpdir(), "autoservice-client-tests-"));
try {
  const outfile = join(directory, "regressions.mjs");
  await build({
    entryPoints: [fileURLToPath(new URL("./regressions.mjs", import.meta.url))],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
    define: { "import.meta.env": "{}" },
    banner: {
      js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
    },
    loader: { ".css": "empty" },
  });
  await import(outfile);
} finally {
  await rm(directory, { recursive: true, force: true });
}
