#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT_DIR, "src", "posts");
const OUTPUT_FILE = path.join(ROOT_DIR, "src", "_data", "gitHistory.json");

function shellQuote(input) {
  return `'${String(input).replace(/'/g, `'\\''`)}'`;
}

function runGitCommand(command) {
  return execSync(command, {
    cwd: ROOT_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function normalizeRepoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("git@github.com:")) {
    return trimmed
      .replace("git@github.com:", "https://github.com/")
      .replace(/\.git$/i, "");
  }

  return trimmed
    .replace(/^git\+/, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
}

function readRepositoryUrl() {
  const envRepo = normalizeRepoUrl(process.env.GITHUB_REPO_URL);
  if (envRepo) {
    return envRepo;
  }

  const packageJsonPath = path.join(ROOT_DIR, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (typeof pkg.repository === "string") {
      return normalizeRepoUrl(pkg.repository);
    }

    if (pkg.repository && typeof pkg.repository.url === "string") {
      return normalizeRepoUrl(pkg.repository.url);
    }
  } catch (error) {
    return null;
  }

  return null;
}

function getPostFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
}

function getSlugForFile(absolutePath, fileName) {
  const fallback = path.basename(fileName, path.extname(fileName));
  try {
    const raw = fs.readFileSync(absolutePath, "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      return fallback;
    }

    const frontMatter = match[1];
    const slugMatch = frontMatter.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
    if (slugMatch && slugMatch[1]) {
      return slugMatch[1].trim();
    }

    const permalinkMatch = frontMatter.match(/^permalink:\s*["']?([^"'\n]+)["']?\s*$/m);
    if (permalinkMatch && permalinkMatch[1]) {
      const clean = permalinkMatch[1].trim().replace(/^\/+|\/+$/g, "");
      if (clean) {
        const segments = clean.split("/");
        return segments[segments.length - 1] || fallback;
      }
    }
  } catch (error) {
    return fallback;
  }

  return fallback;
}

function parseGitLogOutput(output, repoUrl) {
  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash = "", dateISO = "", message = ""] = line.split("\t");
      return {
        hash,
        date: dateISO,
        message,
        url: repoUrl && hash ? `${repoUrl}/commit/${hash}` : null,
      };
    })
    .filter((entry) => entry.hash);
}

function writeOutput(payload) {
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function buildGitHistory() {
  const result = {
    generatedAt: new Date().toISOString(),
    repoUrl: readRepositoryUrl(),
    warning: null,
    posts: {},
    byFile: {},
  };

  const warnings = [];
  const files = getPostFiles();

  let inGitRepo = false;
  try {
    inGitRepo = runGitCommand("git rev-parse --is-inside-work-tree") === "true";
  } catch (error) {
    inGitRepo = false;
  }

  if (!inGitRepo) {
    result.warning = "Git history unavailable: not running inside a git repository.";
    writeOutput(result);
    return;
  }

  for (const fileName of files) {
    const absolutePath = path.join(POSTS_DIR, fileName);
    const relativePath = path.posix.join("src", "posts", fileName);
    const slug = getSlugForFile(absolutePath, fileName);

    let commits = [];
    try {
      const gitOutput = runGitCommand(
        `git log --follow --format=%H%x09%aI%x09%s -- ${shellQuote(relativePath)}`
      );
      commits = parseGitLogOutput(gitOutput, result.repoUrl);
    } catch (error) {
      warnings.push(`Unable to read git log for ${relativePath}.`);
    }

    const entry = {
      revisions: Math.max(commits.length, 1),
      lastUpdated: commits.length ? commits[0].date : null,
      commits,
    };

    result.posts[slug] = entry;
    result.byFile[relativePath] = entry;
  }

  if (warnings.length > 0) {
    result.warning = warnings.join(" ");
  }

  writeOutput(result);
}

try {
  buildGitHistory();
  console.log(`Git history data written to ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
} catch (error) {
  const fallback = {
    generatedAt: new Date().toISOString(),
    repoUrl: readRepositoryUrl(),
    warning: "Git history generation failed. Falling back to empty metadata.",
    posts: {},
    byFile: {},
  };
  writeOutput(fallback);
  console.warn(fallback.warning);
}
