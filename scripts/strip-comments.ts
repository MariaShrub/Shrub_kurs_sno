import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const PRESERVE = [
  /eslint-/,
  /@ts-(ignore|expect-error|nocheck)/,
  /biome-/,
];

function shouldPreserve(text: string): boolean {
  return PRESERVE.some((re) => re.test(text));
}

function stripComments(source: string, fileName: string): string {
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const ranges: Array<{ pos: number; end: number; text: string }> = [];
  const seen = new Set<string>();

  function addRange(pos: number, end: number) {
    const key = `${pos}-${end}`;
    if (seen.has(key)) return;
    seen.add(key);
    const text = source.slice(pos, end);
    if (shouldPreserve(text)) return;
    ranges.push({ pos, end, text });
  }

  function visit(node: ts.Node) {
    const leading = ts.getLeadingCommentRanges(source, node.getFullStart());
    if (leading) for (const c of leading) addRange(c.pos, c.end);

    const trailing = ts.getTrailingCommentRanges(source, node.getEnd());
    if (trailing) for (const c of trailing) addRange(c.pos, c.end);

    ts.forEachChild(node, visit);
  }

  visit(sf);

  ranges.sort((a, b) => b.pos - a.pos);

  let result = source;
  for (const { pos, end } of ranges) {
    let realStart = pos;
    while (
      realStart > 0 &&
      (result[realStart - 1] === " " || result[realStart - 1] === "\t")
    ) {
      realStart--;
    }
    const isLineStart = realStart === 0 || result[realStart - 1] === "\n";

    let realEnd = end;
    if (isLineStart && result[realEnd] === "\n") {
      realEnd++;
    } else {
      realStart = pos;
    }

    result = result.slice(0, realStart) + result.slice(realEnd);
  }

  result = result.replace(/\n{3,}/g, "\n\n");
  return result;
}

async function main() {
  const exclude = new Set(["scripts/strip-comments.ts"]);

  const proc = spawnSync(
    "find",
    [
      "src",
      "scripts",
      "tests",
      "-type",
      "f",
      "(",
      "-name",
      "*.ts",
      "-o",
      "-name",
      "*.tsx",
      ")",
    ],
    { encoding: "utf8" },
  );
  const files = proc.stdout
    .split("\n")
    .filter(Boolean)
    .filter((f) => !exclude.has(f));

  let changed = 0;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const stripped = stripComments(source, file);

    try {
      const sf = ts.createSourceFile(
        file,
        stripped,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      const diagnostics = (sf as unknown as { parseDiagnostics?: ts.Diagnostic[] })
        .parseDiagnostics;
      if (diagnostics && diagnostics.length > 0) {
        console.warn(`  ⚠ ${file}: ${diagnostics.length} parse errors after strip — пропускаю`);
        continue;
      }
    } catch (e) {
      console.warn(`  ⚠ ${file}: parse error — пропускаю`, e);
      continue;
    }

    if (stripped !== source) {
      await writeFile(file, stripped);
      changed++;
      const removed = source.length - stripped.length;
      console.log(`  ${file} (-${removed} chars)`);
    }
  }

  console.log(`\n✓ Обработано ${files.length} файлов, изменено ${changed}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});
