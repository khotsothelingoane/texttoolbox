// Client-side text extraction for uploaded files. Nothing here uses the network,
// logs content, or stores files. Heavy parsers are loaded lazily on first use.

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_TEXT_CHARS = 5_000_000; // matches the tool input limit
export const ACCEPT = ".txt,.csv,.docx,.pdf,text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type Extracted = { ok: true; text: string } | { ok: false; error: string };
type Kind = "txt" | "csv" | "docx" | "pdf";

const MIME: Record<Kind, string[]> = {
  txt: ["text/plain"],
  csv: ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain", "text/x-csv"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  pdf: ["application/pdf"],
};

const MSG = {
  type: "This file type isn’t supported. Please choose a TXT, CSV, DOCX or text-based PDF file.",
  empty: "No readable text was found in this file.",
  big: `This file is too large. The limit is ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
  bigText: "This file contains more text than the tools can handle in the browser. Try a smaller file.",
  corrupt: "We couldn’t read this file. It may be damaged or not a valid file of this type.",
  pdfNoText: "We couldn’t find selectable text in this PDF. This tool currently works with text-based PDFs.",
  pdfPass: "This PDF is password-protected. Remove the password and try again.",
  docxEnc: "This document appears to be encrypted or in an older Word format. Save it as an unprotected .docx file and try again.",
  generic: "Something went wrong while reading this file. Please try another file.",
};

const kindOf = (name: string): Kind | null => {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  const e = m ? m[1].toLowerCase() : "";
  return e === "txt" || e === "csv" || e === "docx" || e === "pdf" ? e : null;
};

const startsWith = (b: Uint8Array, sig: number[]) => sig.every((v, i) => b[i] === v);

export function decodeText(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) return new TextDecoder("utf-16le").decode(b);
  if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) return new TextDecoder("utf-16be").decode(b);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(b); // strips a UTF-8 BOM
  } catch {
    return new TextDecoder("windows-1252").decode(b); // legacy files that are not valid UTF-8
  }
}

/** Parses CSV (comma, semicolon or tab separated, quotes supported) into readable tab-separated rows. */
export function csvToText(raw: string): string {
  const src = raw.replace(/^\uFEFF/, "");
  const first = src.split(/\r\n|\r|\n/, 1)[0] ?? "";
  const count = (c: string) => first.split(c).length - 1;
  const delim = count("\t") > 0 && count("\t") >= count(",") ? "\t" : count(";") > count(",") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"' && cell === "") q = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && src[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); } // tolerant of an unclosed quote or missing final newline
  return rows
    .map((r) => r.map((v) => v.replace(/\r\n|\r|\n/g, " ").trim()).join("\t").replace(/\t+$/, ""))
    .filter((l, i, a) => l !== "" || (i > 0 && i < a.length - 1 && a[i + 1] !== "")) // drop empty rows at the end
    .join("\n")
    .replace(/\n+$/, "");
}

async function docxToText(buf: ArrayBuffer): Promise<string> {
  const b = new Uint8Array(buf);
  if (startsWith(b, [0xd0, 0xcf, 0x11, 0xe0])) throw new Error("docxEnc");
  if (!startsWith(b, [0x50, 0x4b])) throw new Error("corrupt");
  const mod = await import("mammoth/mammoth.browser.js");
  const mammoth = ((mod as unknown as { default?: typeof mod.default }).default ?? mod) as typeof mod.default;
  // convertToHtml keeps soft line breaks, table cells and list items that extractRawText drops.
  const { value } = await mammoth.convertToHtml({ arrayBuffer: buf }, { convertImage: mammoth.images.imgElement(() => Promise.resolve({ src: "" })) });
  return htmlToText(value);
}

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
/** Converts mammoth's simple, well-formed HTML output into plain text (no DOM needed). */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li|tr|blockquote)>/gi, "\n")
    .replace(/<\/(td|th)>/gi, "\t")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === "#") { const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ""; }
      return ENT[e.toLowerCase()] ?? m;
    })
    .replace(/\t+\n/g, "\n")
    .replace(/\n+$/, "");
}

type PdfItem = { str?: string; hasEOL?: boolean };
async function pdfToText(buf: ArrayBuffer): Promise<string> {
  const b = new Uint8Array(buf);
  if (!startsWith(b, [0x25, 0x50, 0x44, 0x46])) throw new Error("corrupt"); // %PDF
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (typeof window !== "undefined") pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({ data: b.slice(), isEvalSupported: false, verbosity: 0 });
  try {
    const doc = await task.promise;
    const pages: string[] = [];
    let total = 0;
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      let s = "";
      for (const it of content.items as PdfItem[]) {
        if (typeof it.str !== "string") continue;
        s += it.str + (it.hasEOL ? "\n" : "");
      }
      page.cleanup();
      s = s.replace(/[ \t]+\n/g, "\n").replace(/\n+$/, "");
      total += s.length;
      if (total > MAX_TEXT_CHARS) throw new Error("bigText");
      pages.push(s);
    }
    await doc.destroy();
    const text = pages.filter((p) => p.trim()).join("\n");
    if (!text.trim()) throw new Error("pdfNoText");
    return text;
  } catch (e) {
    void task.destroy();
    throw e;
  }
}

export async function extractText(file: { name: string; size: number; type?: string; arrayBuffer(): Promise<ArrayBuffer> }): Promise<Extracted> {
  try {
    const kind = kindOf(file.name);
    if (!kind) return { ok: false, error: MSG.type };
    const t = file.type || "";
    if (t && t !== "application/octet-stream" && !MIME[kind].includes(t)) return { ok: false, error: MSG.type };
    if (file.size > MAX_FILE_BYTES) return { ok: false, error: MSG.big };
    if (file.size === 0) return { ok: false, error: MSG.empty };
    const buf = await file.arrayBuffer();
    let text: string;
    if (kind === "txt") text = decodeText(buf);
    else if (kind === "csv") text = csvToText(decodeText(buf));
    else if (kind === "docx") text = await docxToText(buf);
    else text = await pdfToText(buf);
    text = text.replace(/\u0000/g, "");
    if (text.length > MAX_TEXT_CHARS) return { ok: false, error: MSG.bigText };
    if (!text.trim()) return { ok: false, error: MSG.empty };
    return { ok: true, text };
  } catch (e) {
    // Never surface raw errors or file content: map to a fixed set of friendly messages.
    const name = e instanceof Error ? e.name : "";
    const msg = e instanceof Error ? e.message : "";
    if (name === "PasswordException") return { ok: false, error: MSG.pdfPass };
    if (msg === "pdfNoText") return { ok: false, error: MSG.pdfNoText };
    if (msg === "bigText") return { ok: false, error: MSG.bigText };
    if (msg === "docxEnc") return { ok: false, error: MSG.docxEnc };
    if (msg === "corrupt" || name === "InvalidPDFException" || name === "FormatError" || name === "MissingPDFException") return { ok: false, error: MSG.corrupt };
    if (/zip|central directory|end of data|corrupt|invalid/i.test(msg)) return { ok: false, error: MSG.corrupt };
    return { ok: false, error: MSG.generic };
  }
}
