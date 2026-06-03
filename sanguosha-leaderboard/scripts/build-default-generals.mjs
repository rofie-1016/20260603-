import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(root, "scripts", "generals-input.txt"), "utf8");

const items = raw
  .split(/[、，,\n]/)
  .map((s) => s.trim().replace(/[。.]+$/g, ""))
  .filter(Boolean);

const seen = new Set();
const deduped = [];
for (const name of items) {
  if (!seen.has(name)) {
    seen.add(name);
    deduped.push(name);
  }
}

writeFileSync(
  join(root, "lib", "default-generals.json"),
  JSON.stringify(deduped, null, 2),
  "utf8"
);

const indexContent = `/** 内置武将库入口（数据见 default-generals.json） */
import generals from "./default-generals.json";

export const DEFAULT_GENERALS = generals as readonly string[];
export const DEFAULT_GENERALS_COUNT = generals.length;
`;

writeFileSync(join(root, "lib", "default-generals.ts"), indexContent, "utf8");
console.log(`已生成 ${deduped.length} 名内置武将`);
