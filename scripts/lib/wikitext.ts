/** Parse a MediaWiki infobox block into a flat Record<string,string>.
 *
 * Handles:
 *  - {{Infobox Character ... }}, {{Character Infobox ... }}, {{Character_Infobox ... }}
 *  - Wikilinks: [[Foo|Bar]] → "Foo", [[Foo]] → "Foo"
 *  - HTML <br> line breaks → ", "
 *  - Multi-line values (continuation lines without a leading `|`)
 *  - Nested templates are collapsed to their first positional value best-effort.
 */
export function parseInfobox(wikitext: string): Record<string, string> {
  if (!wikitext) return {};

  // Pre-strip <gallery> blocks (can be multi-line, contain `|` separators we don't want).
  const stripped = wikitext.replace(/<gallery[^>]*>[\s\S]*?<\/gallery>/gi, "");

  // Fandom Invincible wiki uses `{{Character ...}}` template. Also accept infobox variants.
  const startMatch = stripped.match(
    /\{\{\s*(?:Character[ _]?Infobox|Infobox[ _]?Character|Character|Infobox)\b/i,
  );
  if (!startMatch || startMatch.index === undefined) return {};
  let i = startMatch.index;
  const source = stripped;

  // Walk forward counting braces to find the matching close.
  let depth = 0;
  let end = -1;
  for (; i < source.length - 1; i++) {
    if (source[i] === "{" && source[i + 1] === "{") {
      depth++;
      i++;
    } else if (source[i] === "}" && source[i + 1] === "}") {
      depth--;
      i++;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) return {};
  const block = source.slice(startMatch.index, end);

  // Strip outermost {{…}}
  const inner = block.slice(2, -2);

  // Split by top-level `|` (not inside nested {{…}} or [[…]])
  const parts: string[] = [];
  let buf = "";
  let td = 0,
    ld = 0;
  for (let j = 0; j < inner.length; j++) {
    const c = inner[j];
    const next = inner[j + 1];
    if (c === "{" && next === "{") {
      td++;
      buf += "{{";
      j++;
      continue;
    }
    if (c === "}" && next === "}") {
      td--;
      buf += "}}";
      j++;
      continue;
    }
    if (c === "[" && next === "[") {
      ld++;
      buf += "[[";
      j++;
      continue;
    }
    if (c === "]" && next === "]") {
      ld--;
      buf += "]]";
      j++;
      continue;
    }
    if (c === "|" && td === 0 && ld === 0) {
      parts.push(buf);
      buf = "";
      continue;
    }
    buf += c;
  }
  parts.push(buf);
  parts.shift(); // first part is the template name

  const out: Record<string, string> = {};
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toLowerCase().replace(/\s+/g, "_");
    let val = part.slice(eq + 1).trim();
    val = cleanWikiValue(val);
    if (key && val) out[key] = val;
  }
  return out;
}

export function cleanWikiValue(val: string): string {
  let v = val;
  // Repeatedly strip innermost templates until stable.
  for (let pass = 0; pass < 5; pass++) {
    const next = v.replace(/\{\{[^{}]*\}\}/g, "");
    if (next === v) break;
    v = next;
  }
  return v
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<gallery[^>]*>[\s\S]*?<\/gallery>/gi, "")
    .replace(/<small>|<\/small>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, ", ")
    .replace(/<sup>[\s\S]*?<\/sup>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<ref[^\/]*\/>/gi, "")
    .replace(/<u>|<\/u>|<b>|<\/b>|<i>|<\/i>/gi, "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/'''/g, "")
    .replace(/''/g, "")
    .replace(/^\s*\*\s*/gm, "")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();
}

/** Pull quotes out of wikitext — rough, but a useful cross-reference against hand-curated quotes. */
export function extractQuotesFromWikitext(wikitext: string): string[] {
  const matches = wikitext.match(/"[^"\n]{15,200}"/g) ?? [];
  return [...new Set(matches.map((q) => q.replace(/^"|"$/g, "").trim()))].slice(0, 5);
}
