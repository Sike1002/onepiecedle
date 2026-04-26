import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import PQueue from "p-queue";

export const queue = new PQueue({ concurrency: 2, interval: 1000, intervalCap: 1 });

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function ensureDir(path: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2), "utf8");
}

export async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as T;
}

export function safeSlug(title: string): string {
  return title
    .replace(/[\s_]+/g, "_")
    .replace(/[^A-Za-z0-9_\-\.]/g, "")
    .slice(0, 80);
}

/**
 * Fetch JSON from a URL with a file-based cache. Caches on disk at
 * `scripts/data/cache/{tag}/{key}.json` so the pipeline is idempotent across runs.
 */
export async function cachedFetchJson<T = unknown>(
  url: string,
  tag: string,
  key: string,
): Promise<T> {
  const path = `scripts/data/cache/${tag}/${safeSlug(key)}.json`;
  if (existsSync(path)) {
    return readJson<T>(path);
  }
  const data = await queue.add(async () => {
    const res = await fetch(url, {
      headers: { "User-Agent": "Invincibledle-fan-build/0.1 (fan project, non-commercial)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return (await res.json()) as T;
  });
  await writeJson(path, data);
  return data as T;
}

/** Cached binary fetch — returns the path to the cached file on disk. */
export async function cachedFetchBinary(url: string, tag: string, key: string): Promise<string> {
  const { writeFile: wf } = await import("fs/promises");
  const path = `scripts/data/cache/${tag}/${safeSlug(key)}.bin`;
  if (existsSync(path)) return path;
  const buf = await queue.add(async () => {
    const res = await fetch(url, {
      headers: { "User-Agent": "Invincibledle-fan-build/0.1 (fan project, non-commercial)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return Buffer.from(await res.arrayBuffer());
  });
  await mkdir(dirname(path), { recursive: true });
  await wf(path, buf);
  return path;
}

export function log(phase: string, msg: string): void {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] [${phase}] ${msg}`);
}

export function banner(phase: string): void {
  console.log("");
  console.log("═".repeat(64));
  console.log(`  ${phase}`);
  console.log("═".repeat(64));
}
