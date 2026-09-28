import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { extractText, MAX_FILE_BYTES, csvToText } from "../lib/extract.ts";
import * as p from "../lib/process.ts";

const fx = (n: string) => new File([readFileSync(new URL(`./fixtures/${n}`, import.meta.url))], n);
const ok = async (n: string) => { const r = await extractText(fx(n)); assert.ok(r.ok, `${n}: ${r.ok ? "" : r.error}`); return (r as { text: string }).text; };
const fail = async (n: string, re: RegExp, file: File = fx(n)) => { const r = await extractText(file); assert.ok(!r.ok, `${n} should fail`); assert.match((r as { error: string }).error, re, n); assert.doesNotMatch((r as { error: string }).error, /Error|undefined|at \w+/); console.log("ok  ", n, "→", (r as { error: string }).error.slice(0, 50)); };

// TXT
let t = await ok("normal.txt");
assert.equal(t.split("\n").length, 5); assert.match(t, /café, naïve/); assert.match(t, /😀🎉/); assert.match(t, /umuntu ngumuntu ngabantu/); console.log("ok   txt: lines, accents, African-language text, emoji");
assert.equal(await ok("bad-text.txt"), "café"); console.log("ok   txt: non-UTF-8 legacy fallback");

// CSV
t = await ok("rows.csv");
assert.equal(t, 'name\temail\tsite\nAda\tada@example.com\thttps://ada.example.com\nSmith, John\tjohn@example.org\twww.john.org\nMulti line\tm@x.io\tsay "hi"'); console.log("ok   csv: rows, quoted commas, embedded newline, escaped quotes");
assert.equal(p.extractEmails(t, { unique: true }).output, "ada@example.com\njohn@example.org\nm@x.io");
assert.equal(p.extractUrls(t, { unique: true }).output, "https://ada.example.com\nwww.john.org"); console.log("ok   csv → existing Extract Emails / URLs logic");
assert.equal(await ok("semi.csv"), "a\tb\n1\t2"); console.log("ok   csv: semicolon delimiter");
assert.equal(csvToText('a,"unclosed\nb'), "a\tunclosed b"); console.log("ok   csv: malformed (unclosed quote) does not crash");

// DOCX
t = await ok("report.docx");
console.log(JSON.stringify(t));
assert.match(t, /^Quarterly Report\nRevenue grew 12\.5% in Q3, reaching R1,250,000\./); assert.match(t, /Details\nLine one\nLine two/); assert.doesNotMatch(t, /\n\n/); assert.ok(!t.endsWith("\n"));
assert.equal(p.extractEmails(t, {}).output, "sales@example.com"); assert.match(p.wordCount(t).output, /Words: 29\n/); console.log("ok   docx: headings, paragraphs, punctuation, numbers, soft break → existing tools");
await fail("empty.docx", /No readable text/);
await fail("corrupt.docx", /damaged|couldn.t read/i);
await fail("fake-encrypted.docx", /encrypted/i);

// PDF
t = await ok("multi.pdf");
console.log(JSON.stringify(t.slice(0, 80)));
const ls = t.split("\n"); assert.equal(ls.length, 15); assert.equal(ls[0], "Page 1 line 1 — hello café"); assert.equal(ls[14], "Page 3 line 5 — hello café"); console.log("ok   pdf: 3 pages, 15 lines in order, accents");
assert.equal(p.removeDuplicateLines(t, { trim: true }).output.split("\n").length, 15); assert.match(p.lineCount(t).output, /Total lines: 15/); console.log("ok   pdf → existing Remove Duplicate Lines / Line Counter");
await fail("scanned.pdf", /selectable text/);
await fail("blank.pdf", /selectable text/);
await fail("encrypted.pdf", /password/i);
await fail("corrupt.pdf", /damaged|couldn.t read/i);
await fail("empty.txt", /No readable text/); await fail("blank.txt", /No readable text/);
await fail("unsupported.png", /isn.t supported/);
await fail("x", /isn.t supported/, new File(["hi"], "notes.rtf"));
await fail("x", /isn.t supported/, new File(["hi"], "noext"));
await fail("x", /isn.t supported/, new File(["hi"], "evil.txt", { type: "image/png" }));
assert.ok((await extractText(new File(["a,b"], "d.csv", { type: "application/vnd.ms-excel" }))).ok); console.log("ok   csv with Windows MIME accepted");
assert.ok((await extractText(new File(["hi"], "UPPER.TXT", { type: "" }))).ok); console.log("ok   uppercase extension, empty MIME accepted");
const big = { name: "big.txt", size: MAX_FILE_BYTES + 1, type: "text/plain", arrayBuffer: async () => { throw new Error("must not be read"); } };
await fail("oversized", /too large.*10 MB/, big as unknown as File);
{ const r = await extractText(new File([new Uint8Array(MAX_FILE_BYTES).fill(97)], "edge.txt")); assert.ok(!r.ok && /more text than the tools/.test(r.error), "at the size limit the file is read, then rejected for text length"); console.log("ok   file exactly at 10 MB passes the size check; 10M characters rejected as too much text"); }
{ const r = await extractText(new File([new Uint8Array(3_000_000).fill(97)], "ok.txt")); assert.ok(r.ok && r.text.length === 3_000_000); console.log("ok   3 MB text file loads in full"); }
console.log("all extraction tests passed");
