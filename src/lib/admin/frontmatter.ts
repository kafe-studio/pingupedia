// Thin wrapper around `yaml` lib: split markdown into frontmatter + body,
// parse YAML preserving key order + format, stringify back.

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const FM_START = /^---\r?\n/;
const FM_END = /\r?\n---\r?\n/;

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>;
  body: string;
}

export class FrontmatterParseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "FrontmatterParseError";
  }
}

export function splitMarkdown(raw: string): { fmText: string; body: string } {
  if (!FM_START.test(raw)) {
    throw new FrontmatterParseError("Soubor nezačíná `---` frontmatter blokem.");
  }
  const afterStart = raw.replace(FM_START, "");
  const endMatch = afterStart.match(FM_END);
  if (!endMatch || endMatch.index === undefined) {
    throw new FrontmatterParseError("Neuzavřený frontmatter blok — chybí druhé `---`.");
  }
  const fmText = afterStart.slice(0, endMatch.index);
  const body = afterStart.slice(endMatch.index + endMatch[0].length);
  return { fmText, body };
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  const { fmText, body } = splitMarkdown(raw);
  let frontmatter: unknown;
  try {
    frontmatter = parseYaml(fmText);
  } catch (err) {
    throw new FrontmatterParseError("Chyba při parsování YAML frontmatteru.", err);
  }
  if (frontmatter === null || typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
    throw new FrontmatterParseError("Frontmatter musí být objekt (klíč: hodnota páry).");
  }
  return { frontmatter: frontmatter as Record<string, unknown>, body };
}

export function buildMarkdown(frontmatter: Record<string, unknown>, body: string): string {
  const yaml = stringifyYaml(frontmatter, {
    lineWidth: 0,
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN",
  });
  const normalizedBody = body.startsWith("\n") ? body : `\n${body}`;
  return `---\n${yaml}---${normalizedBody}`;
}
