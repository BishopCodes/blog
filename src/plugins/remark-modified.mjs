import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";

export function remarkModified() {
  return function (_, file) {
    // ponytail: git history when available, else file mtime — a fresh repo
    // has no commits and git log would crash the whole render.
    let modified = "";

    try {
      const filepath = file.history[0];
      modified = execSync(`git log -1 --pretty="format:%cI" -- "${filepath}"`, {
        stdio: "pipe",
      })
        .toString()
        .trim();
    } catch {
      // untracked file or no git history yet
    }

    if (!modified) {
      const filepath = path.resolve(process.cwd(), file.history[0]);
      modified = statSync(filepath).mtime.toISOString();
    }

    file.data.astro.frontmatter.lastModified = modified;
  };
}
