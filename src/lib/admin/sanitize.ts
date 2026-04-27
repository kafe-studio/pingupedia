// Minimal HTML sanitizer pro pole, která se renderují přes set:html.
// Allowlist: <br>, <strong>, <em>, <span class="text-accent|text-primary">.
// Stripuje vše ostatní (scripty, event handlery, anchor hrefy, libovolné atributy).

const ALLOWED_TAGS = new Set(["br", "strong", "em", "span"]);
const ALLOWED_CLASSES = new Set(["text-accent", "text-primary"]);

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
      const name = String(tag).toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      const closing = match.startsWith("</");
      if (name !== "span") return closing ? `</${name}>` : `<${name}>`;
      if (closing) return "</span>";
      const classAttr = match.match(/class\s*=\s*["']([^"']*)["']/i);
      if (!classAttr) return "<span>";
      const kept = classAttr[1]
        .split(/\s+/)
        .filter((c) => ALLOWED_CLASSES.has(c));
      return kept.length ? `<span class="${kept.join(" ")}">` : "<span>";
    });
}

// Rekurzivně sanitizuje hodnoty u klíčů končících na "Html" v libovolně hluboké struktuře.
export function sanitizeJsonHtmlFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeJsonHtmlFields);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = k.endsWith("Html") && typeof v === "string"
        ? sanitizeHtml(v)
        : sanitizeJsonHtmlFields(v);
    }
    return out;
  }
  return value;
}
