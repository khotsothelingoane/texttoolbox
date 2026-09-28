// Pure text-processing functions. No DOM access, so they are easy to test.
export type Opts = Record<string, boolean | string>;
export type Result = { output: string; stats?: string; note?: string };

const lines = (t: string) => t.split(/\r\n|\r|\n/);
const plural = (n: number, w: string) => `${n.toLocaleString("en")} ${w}${n === 1 ? "" : "s"}`;

export function removeDuplicateLines(t: string, o: Opts): Result {
  const seen = new Set<string>();
  const out: string[] = [];
  const src = lines(t);
  for (const l of src) {
    let k = o.trim ? l.trim() : l;
    if (!o.caseSensitive) k = k.toLowerCase();
    if (o.skipBlank && k === "") { out.push(l); continue; }
    if (!seen.has(k)) { seen.add(k); out.push(l); }
  }
  return { output: out.join("\n"), stats: `${plural(src.length - out.length, "duplicate line")} removed, ${plural(out.length, "line")} left` };
}

export function removeBlankLines(t: string, o: Opts): Result {
  const src = lines(t);
  const out = src.filter((l) => l.trim() !== "");
  const res = o.collapse ? collapseBlank(src) : out;
  return { output: res.join("\n"), stats: `${plural(src.length - res.length, "blank line")} removed` };
}
function collapseBlank(src: string[]) {
  const out: string[] = [];
  for (const l of src) if (!(l.trim() === "" && out.length && out[out.length - 1].trim() === "")) out.push(l);
  return out;
}

export function removeExtraSpaces(t: string): Result {
  const out = lines(t).map((l) => l.replace(/[ \t\u00a0]+/g, " ").trim()).join("\n");
  return { output: out, stats: `${plural(t.length - out.length, "character")} removed` };
}

export function removeDuplicateWords(t: string, o: Opts): Result {
  const seen = new Set<string>();
  let removed = 0;
  const out = lines(t).map((line) => {
    const parts = line.split(/(\s+)/);
    const kept: string[] = [];
    for (const p of parts) {
      if (/^\s+$/.test(p) || p === "") { kept.push(p); continue; }
      const key = (o.caseSensitive ? p : p.toLowerCase()).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      if (key && seen.has(key)) { removed++; if (kept.length && /^\s+$/.test(kept[kept.length - 1])) kept.pop(); continue; }
      if (key) seen.add(key);
      kept.push(p);
    }
    return kept.join("").trim();
  }).join("\n");
  return { output: out, stats: `${plural(removed, "duplicate word")} removed` };
}

export function removePunctuation(t: string, o: Opts): Result {
  const re = o.keepApostrophes ? /[^\p{L}\p{N}\s'’]/gu : /[^\p{L}\p{N}\s]/gu;
  const out = t.replace(re, "");
  return { output: out, stats: `${plural(t.length - out.length, "character")} removed` };
}

export function removeNumbers(t: string, o: Opts): Result {
  const out = o.digitsOnly ? t.replace(/\d/g, "") : t.replace(/\d+(?:[.,]\d+)*/g, "");
  return { output: out, stats: `${plural(t.length - out.length, "character")} removed` };
}

export function trimWhitespace(t: string, o: Opts): Result {
  const out = o.perLine ? lines(t).map((l) => l.trim()).join("\n") : t.trim();
  return { output: out, stats: `${plural(t.length - out.length, "character")} removed` };
}

export const upper = (t: string): Result => ({ output: t.toUpperCase() });
export const lower = (t: string): Result => ({ output: t.toLowerCase() });

const SMALL = new Set("a an and as at but by for if in nor of on or per the to up via vs".split(" "));
export function titleCase(t: string, o: Opts): Result {
  const out = t.toLowerCase().replace(/(^|[\s(["“‘—–-]+)([\p{L}\p{N}][\p{L}\p{N}'’]*)/gu, (m, pre: string, w: string, off: number, whole: string) => {
    const first = off === 0 || /[.!?:]\s*$/.test(whole.slice(0, off));
    const end = off + m.length >= whole.trimEnd().length;
    if (o.smallWords && !first && !end && SMALL.has(w)) return pre + w;
    return pre + w.charAt(0).toUpperCase() + w.slice(1);
  });
  return { output: out };
}

export function sentenceCase(t: string): Result {
  const out = t.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_m, pre: string, c: string) => pre + c.toUpperCase()).replace(/\bi\b(?=['’\s.,!?]|$)/g, "I");
  return { output: out };
}

export function reverseText(t: string, o: Opts): Result {
  const mode = o.mode || "characters";
  const seg = (s: string) => (typeof Intl !== "undefined" && "Segmenter" in Intl ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s), (x) => x.segment) : Array.from(s));
  let out: string;
  if (mode === "words") out = lines(t).map((l) => l.split(/(\s+)/).reverse().join("")).join("\n");
  else if (mode === "lines") out = lines(t).reverse().join("\n");
  else out = seg(t).reverse().join("");
  return { output: out };
}

export function sortLines(t: string, o: Opts): Result {
  const src = lines(t);
  const dir = o.order === "desc" ? -1 : 1;
  const cmp = (a: string, b: string) => {
    if (o.numeric) { const x = parseFloat(a), y = parseFloat(b); if (!isNaN(x) && !isNaN(y) && x !== y) return (x - y) * dir; }
    return a.localeCompare(b, undefined, { sensitivity: o.caseSensitive ? "variant" : "base", numeric: !!o.numeric }) * dir;
  };
  let arr = o.ignoreBlank ? src.filter((l) => l.trim() !== "") : src.slice();
  arr = arr.sort(cmp);
  return { output: arr.join("\n"), stats: `${plural(arr.length, "line")} sorted ${dir === 1 ? "A–Z" : "Z–A"}` };
}

export function words(t: string): string[] { return t.match(/[^\s]+/g) ?? []; }
export function wordCount(t: string): Result {
  const w = words(t).length;
  const sentences = (t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).filter((s) => s.trim()).length;
  const paragraphs = t.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const mins = Math.max(0, Math.ceil(w / 238));
  return { output: `Words: ${w}\nSentences: ${sentences}\nParagraphs: ${paragraphs}\nReading time: ${w ? mins : 0} min (about 238 words per minute)`, stats: plural(w, "word") };
}
export function charCount(t: string): Result {
  const chars = Array.from(t).length;
  const noSpaces = Array.from(t.replace(/\s/g, "")).length;
  return { output: `Characters (with spaces): ${chars}\nCharacters (no spaces): ${noSpaces}\nLetters: ${(t.match(/\p{L}/gu) ?? []).length}\nDigits: ${(t.match(/\d/g) ?? []).length}`, stats: plural(chars, "character") };
}
export function lineCount(t: string): Result {
  const src = t === "" ? [] : lines(t);
  const nonEmpty = src.filter((l) => l.trim()).length;
  return { output: `Total lines: ${src.length}\nNon-empty lines: ${nonEmpty}\nBlank lines: ${src.length - nonEmpty}`, stats: plural(src.length, "line") };
}

function uniq(a: string[], dedupe: boolean, ci = false) {
  if (!dedupe) return a;
  const s = new Set<string>();
  return a.filter((x) => { const k = ci ? x.toLowerCase() : x; if (s.has(k)) return false; s.add(k); return true; });
}
export function extractEmails(t: string, o: Opts): Result {
  const m = t.match(/[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g) ?? [];
  const r = uniq(m, o.unique !== false, true);
  return { output: r.join("\n"), stats: `${plural(r.length, "email address")} found`, note: r.length ? undefined : "No email addresses found in the text." };
}
export function extractUrls(t: string, o: Opts): Result {
  const m = (t.match(/(?:https?:\/\/|www\.)[^\s<>"'`]+/gi) ?? []).map((u) => u.replace(/[.,;:!?)\]}'"]+$/, ""));
  const r = uniq(m, o.unique !== false);
  return { output: r.join("\n"), stats: `${plural(r.length, "URL")} found`, note: r.length ? undefined : "No URLs found. The tool looks for links starting with http://, https:// or www." };
}
export function extractPhones(t: string, o: Opts): Result {
  const m = (t.match(/(?<![\w])(?:\+|00)?\(?\d[\d\s().-]{6,17}\d(?![\w])/g) ?? []).map((s) => s.trim()).filter((s) => { const d = s.replace(/\D/g, ""); return d.length >= 7 && d.length <= 15 && !/^(19|20)\d{2}[-/]\d/.test(s); });
  const r = uniq(m, o.unique !== false);
  return { output: r.join("\n"), stats: `${plural(r.length, "phone number")} found`, note: r.length ? undefined : "No phone numbers found. Numbers need 7 to 15 digits, with optional +, spaces, dashes or brackets." };
}
