import assert from "node:assert/strict";
import * as p from "../lib/process.ts";
import { runners } from "../lib/runners.ts";
import { tools, defaultOpts } from "../lib/tools.ts";

const eq = (name: string, got: string, want: string) => { assert.equal(got, want, name); console.log("ok  ", name); };

eq("dup lines", p.removeDuplicateLines("a\nb\nA\nb\nc", { trim: true }).output, "a\nb\nc");
eq("dup lines case-sensitive", p.removeDuplicateLines("a\nA", { caseSensitive: true }).output, "a\nA");
eq("blank lines", p.removeBlankLines("a\n\n \nb", {}).output, "a\nb");
eq("blank collapse", p.removeBlankLines("a\n\n\n\nb", { collapse: true }).output, "a\n\nb");
eq("extra spaces", p.removeExtraSpaces("  a   b \n c    d ").output, "a b\nc d");
eq("dup words", p.removeDuplicateWords("red green red blue Green", {}).output, "red green blue");
eq("punctuation", p.removePunctuation("Hi, it's 9:30!", {}).output, "Hi its 930");
eq("punctuation keep apostrophe", p.removePunctuation("Hi, it's!", { keepApostrophes: true }).output, "Hi it's");
eq("punctuation unicode", p.removePunctuation("Café—déjà vu.", {}).output, "Cafédéjà vu");
eq("numbers", p.removeNumbers("Order 4521 for R1,250.75 total", {}).output, "Order  for R total");
eq("numbers digits only", p.removeNumbers("a1,2b", { digitsOnly: true }).output, "a,b");
eq("trim per line", p.trimWhitespace("  a  \n b ", { perLine: true }).output, "a\nb");
eq("trim whole", p.trimWhitespace("  a  \n b  ", { perLine: false }).output, "a  \n b");
eq("upper", p.upper("straße é").output, "STRASSE É");
eq("lower", p.lower("ABC Déf").output, "abc déf");
eq("title", p.titleCase("the quick brown fox jumps over the lazy dog", { smallWords: true }).output, "The Quick Brown Fox Jumps Over the Lazy Dog");
eq("title all", p.titleCase("a tale of two cities", { smallWords: false }).output, "A Tale Of Two Cities");
eq("title last word", p.titleCase("what to look for in", { smallWords: true }).output, "What to Look for In");
eq("sentence", p.sentenceCase("HELLO THERE. i think so! ok").output, "Hello there. I think so! Ok");
eq("reverse chars", p.reverseText("abc 😀", { mode: "characters" }).output, "😀 cba");
eq("reverse words", p.reverseText("one two three", { mode: "words" }).output, "three two one");
eq("reverse lines", p.reverseText("a\nb\nc", { mode: "lines" }).output, "c\nb\na");
eq("sort asc", p.sortLines("pear\nApple\nbanana", { order: "asc", ignoreBlank: true }).output, "Apple\nbanana\npear");
eq("sort desc", p.sortLines("pear\nApple\nbanana", { order: "desc" }).output, "pear\nbanana\nApple");
eq("sort numeric", p.sortLines("10\n2\n1", { order: "asc", numeric: true }).output, "1\n2\n10");
assert.match(p.wordCount("Hello big world. Two sentences!").output, /Words: 5/); console.log("ok   word count");
assert.match(p.wordCount("").output, /Words: 0/); console.log("ok   word count empty");
assert.match(p.charCount("ab c😀").output, /with spaces\): 5\n.*no spaces\): 4/); console.log("ok   char count");
assert.match(p.lineCount("a\n\nb").output, /Total lines: 3\nNon-empty lines: 2\nBlank lines: 1/); console.log("ok   line count");
eq("emails", p.extractEmails("Mail a@x.com, <B@y.co.za>; a@x.com.", { unique: true }).output, "a@x.com\nB@y.co.za");
eq("urls", p.extractUrls("See https://a.com/x, and (www.b.org/p). https://a.com/x", { unique: true }).output, "https://a.com/x\nwww.b.org/p");
eq("phones", p.extractPhones("Call +27 82 123 4567 or (555) 010-9999. Year 2024.", { unique: true }).output, "+27 82 123 4567\n(555) 010-9999");
eq("phones no dates", p.extractPhones("Date 2024-05-12 only", {}).output, "");
eq("empty input safe", p.removeDuplicateLines("", {}).output, "");

// Every tool page: runner exists, matches tool.run, produces output on its own example, unique SEO fields.
const titles = new Set<string>(), descs = new Set<string>();
for (const t of tools) {
  assert.ok(runners[t.slug], `runner for ${t.slug}`);
  const o = defaultOpts(t);
  assert.equal(runners[t.slug](t.exampleIn, o).output, t.run(t.exampleIn, o).output, `runner matches ${t.slug}`);
  assert.ok(t.run(t.exampleIn, o).output.length > 0, `example output for ${t.slug}`);
  assert.ok(!titles.has(t.title) && !descs.has(t.description), `unique meta ${t.slug}`);
  assert.ok(t.title.length <= 75 && t.description.length <= 165, `meta length ${t.slug} (${t.title.length}/${t.description.length})`);
  for (const r of t.related) assert.ok(tools.some((x) => x.slug === r), `related ${r} exists`);
  titles.add(t.title); descs.add(t.description);
}
console.log(`ok   ${tools.length} tool pages consistent`);
