import fs from "node:fs";
import path from "node:path";

const MEDIA = /\.(mp4|webm|mov|jpe?g|png|webp|avif|svg|gif)$/i;

/** public/images と public/videos 以下のメディアファイルを列挙する */
export function scanPublicMedia(): string[] {
  const root = path.join(process.cwd(), "public");
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (MEDIA.test(e.name)) out.push("/" + path.relative(root, full).split(path.sep).join("/"));
    }
  };
  walk(path.join(root, "images"));
  walk(path.join(root, "videos"));
  return out;
}
