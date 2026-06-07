import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const poemsDirectory = path.join(process.cwd(), "poems");

function formatDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}


export type PoemMeta = {
  slug: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export type Poem = PoemMeta & {
  contentHtml: string;
  raw: string;
};

function readPoemFile(fileName: string) {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(poemsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const firstLines = content
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(0, 4)
    .join("\n");

  const meta: PoemMeta = {
    slug,
    title: (data.title as string) ?? slug,
    author: (data.author as string) ?? "Unknown",
    date: formatDate(data.date),
    excerpt: (data.excerpt as string) ?? firstLines,
    tags: (data.tags as string[]) ?? [],
  };

  return { meta, content };
}

export function getAllPoemSlugs(): string[] {
  if (!fs.existsSync(poemsDirectory)) return [];
  return fs
    .readdirSync(poemsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAllPoems(): PoemMeta[] {
  if (!fs.existsSync(poemsDirectory)) return [];
  const fileNames = fs
    .readdirSync(poemsDirectory)
    .filter((file) => file.endsWith(".md"));

  const poems = fileNames.map((fileName) => readPoemFile(fileName).meta);

  return poems.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getRandomPoems(count: number, excludeSlug?: string): PoemMeta[] {
  const pool = getAllPoems().filter((p) => p.slug !== excludeSlug);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export async function getPoemBySlug(slug: string): Promise<Poem | null> {
  const fullPath = path.join(poemsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const { meta, content } = readPoemFile(`${slug}.md`);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    ...meta,
    contentHtml,
    raw: content,
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export type NewPoemInput = {
  author: string;
  poem: string;
  title?: string;
};

export type CreatedPoem = { slug: string; title: string };

export type BuiltPoem = CreatedPoem & {
  /** Repo-relative path, e.g. "poems/my-poem-ab12c.md". */
  relPath: string;
  /** Full markdown file contents (front matter + body). */
  fileContents: string;
};

const MAX_AUTHOR = 60;
const MAX_TITLE = 120;
const MAX_POEM = 4000;

/** Strip HTML tags and control characters from a single line of input. */
function cleanLine(value: string, maxLength: number): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Strip HTML tags from multi-line poem text while keeping line breaks. */
function cleanBody(value: string, maxLength: number): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and sanitizes input, then builds the markdown file for a new poem.
 * Pure (no IO) so the caller can persist it to disk (dev) or GitHub (prod).
 */
export function buildPoemFile(input: NewPoemInput): BuiltPoem {
  const author = cleanLine(input.author || "", MAX_AUTHOR) || "Anonymous";
  const body = cleanBody(input.poem || "", MAX_POEM);

  if (body.length < 2) {
    throw new Error("Poem is empty.");
  }

  const titleSource =
    cleanLine(input.title || "", MAX_TITLE) ||
    body.split("\n").find((line) => line.trim().length > 0)?.trim() ||
    "Untitled";
  const title = titleSource.slice(0, MAX_TITLE);

  const baseSlug = slugify(title) || "poem";
  const suffix = Math.random().toString(36).slice(2, 7);
  const slug = `${baseSlug}-${suffix}`;

  const fileContents = matter.stringify(`\n${body}\n`, {
    title,
    author,
    date: new Date().toISOString().slice(0, 10),
    tags: ["community"],
  });

  return { slug, title, relPath: `poems/${slug}.md`, fileContents };
}

/**
 * Writes a built poem to the local filesystem. Dev-only fallback — Vercel's
 * runtime filesystem is read-only, so production persists via GitHub instead.
 */
export function writePoemFileLocally(built: BuiltPoem): void {
  if (!fs.existsSync(poemsDirectory)) {
    fs.mkdirSync(poemsDirectory, { recursive: true });
  }

  // path.join with a sanitized slug avoids traversal; double-check it stays in dir.
  const fullPath = path.join(poemsDirectory, `${built.slug}.md`);
  if (path.dirname(fullPath) !== poemsDirectory) {
    throw new Error("Invalid poem path.");
  }

  fs.writeFileSync(fullPath, built.fileContents, "utf8");
}
