// Slug → processing function. Kept separate from lib/tools.ts so the client bundle
// for a tool page does not include the written content of every other tool.
import * as p from "./process.ts";
import type { Opts, Result } from "./process.ts";

export const runners: Record<string, (t: string, o: Opts) => Result> = {
  "remove-duplicate-lines": p.removeDuplicateLines,
  "remove-blank-lines": p.removeBlankLines,
  "remove-extra-spaces": (t) => p.removeExtraSpaces(t),
  "remove-duplicate-words": p.removeDuplicateWords,
  "remove-punctuation": p.removePunctuation,
  "remove-numbers": p.removeNumbers,
  "trim-whitespace": p.trimWhitespace,
  "uppercase-converter": (t) => p.upper(t),
  "lowercase-converter": (t) => p.lower(t),
  "title-case-converter": p.titleCase,
  "sentence-case-converter": (t) => p.sentenceCase(t),
  "reverse-text": p.reverseText,
  "sort-lines": p.sortLines,
  "word-counter": (t) => p.wordCount(t),
  "character-counter": (t) => p.charCount(t),
  "line-counter": (t) => p.lineCount(t),
  "extract-emails": p.extractEmails,
  "extract-urls": p.extractUrls,
  "extract-phone-numbers": p.extractPhones,
};
