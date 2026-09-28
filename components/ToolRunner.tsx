"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { runners } from "@/lib/runners";
import type { Opts } from "@/lib/process";
import { ACCEPT, MAX_FILE_BYTES, extractText } from "@/lib/extract";

type OptionDef =
  | { key: string; label: string; type: "checkbox"; default: boolean }
  | { key: string; label: string; type: "select"; default: string; choices: { value: string; label: string }[] };

type Props = {
  slug: string; placeholder: string; options?: OptionDef[]; exampleIn: string; fileName: string;
  analysis?: boolean;
};

const MAX_CHARS = 5_000_000;
const fmt = (n: number) => n.toLocaleString("en");

export default function ToolRunner({ slug, placeholder, options = [], exampleIn, fileName, analysis }: Props) {
  const [text, setText] = useState("");
  const [opts, setOpts] = useState<Opts>(() => Object.fromEntries(options.map((o) => [o.key, o.default])));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadId = useRef(0);
  const [ready, setReady] = useState(false); // the picker stays disabled until the page is interactive
  useEffect(() => setReady(true), []);
  const [loading, setLoading] = useState(false);
  const [fileMsg, setFileMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState<{ name: string; text: string } | null>(null);
  const deferred = useDeferredValue(text);
  const tooBig = text.length > MAX_CHARS;

  const result = useMemo(() => {
    if (deferred === "" || deferred.length > MAX_CHARS) return null;
    try {
      const run = runners[slug];
      return run ? { ok: true as const, r: run(deferred, opts) } : { ok: false as const };
    } catch {
      return { ok: false as const };
    }
  }, [deferred, opts, slug]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const say = (m: string, isErr = false) => {
    if (timer.current) clearTimeout(timer.current);
    if (isErr) { setError(m); setStatus(""); } else { setStatus(m); setError(""); }
    timer.current = setTimeout(() => { setStatus(""); setError(""); }, 4000);
  };

  const output = result && result.ok ? result.r.output : "";
  const stale = deferred !== text;

  async function paste() {
    try {
      const t = await navigator.clipboard.readText();
      if (!t) return say("Your clipboard is empty.", true);
      setText(t);
    } catch {
      say("Your browser blocked clipboard access. Paste into the box with Ctrl+V or long-press instead.", true);
    }
  }
  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      say("Copied to clipboard.");
    } catch {
      try {
        const ta = document.getElementById("result-box") as HTMLTextAreaElement | null;
        ta?.focus(); ta?.select();
        if (document.execCommand("copy")) return say("Copied to clipboard.");
      } catch { /* fall through */ }
      say("Copy failed. The result is selected, so press Ctrl+C (or Cmd+C) to copy it.", true);
      (document.getElementById("result-box") as HTMLTextAreaElement | null)?.select();
    }
  }
  function download() {
    if (!output) return;
    try {
      const url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      say("Download started.");
    } catch {
      say("Download failed in this browser. Use Copy result instead.", true);
    }
  }

  const shortName = (n: string) => (n.length > 40 ? n.slice(0, 18) + "…" + n.slice(-18) : n);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows choosing the same file again
    if (!file) return;
    const id = ++loadId.current;
    setPending(null); setFileMsg(null); setLoading(true);
    const res = await extractText(file);
    if (id !== loadId.current) return; // a newer selection superseded this one
    setLoading(false);
    if (!res.ok) return setFileMsg({ kind: "error", text: res.error });
    if (text.trim() !== "") return setPending({ name: file.name, text: res.text }); // ask before replacing
    applyFile(file.name, res.text);
  }
  function applyFile(name: string, t: string) {
    setText(t); setPending(null);
    setFileMsg({ kind: "ok", text: `${shortName(name)} loaded — ${fmt(t.length)} characters` });
    document.getElementById("input-box")?.focus();
  }
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="card p-4 sm:p-5" id="tool">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor="input-box" className="font-semibold">Your text</label>
        <p className="text-sm" style={{ color: "var(--muted)" }} aria-live="off">{fmt(text.length)} characters · {fmt(words)} words</p>
      </div>
      <textarea id="input-box" className="field mt-2" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
        spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby="tool-msg" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={paste}>Paste</button>
        <button type="button" className="btn" onClick={() => setText(exampleIn)}>Try example</button>
        <button type="button" className="btn" onClick={() => { setText(""); setFileMsg(null); setPending(null); document.getElementById("input-box")?.focus(); }} disabled={!text}>Clear</button>
      </div>

      <div className="mt-4 rounded-md p-3" style={{ border: "1px solid var(--line)" }}>
        <label htmlFor="file-input" className="block text-sm font-semibold">Or upload a file</label>
        <input id="file-input" type="file" accept={ACCEPT} onChange={onFile} disabled={loading || !ready} aria-describedby="file-hint file-msg"
          className="mt-2 block w-full text-sm file:mr-3 file:min-h-[2.75rem] file:cursor-pointer file:rounded-md file:border file:border-[var(--line)] file:bg-[var(--surface)] file:px-4 file:font-semibold file:text-[var(--ink)]" style={{ color: "var(--ink)" }} />
        <p id="file-hint" className="mt-2 text-sm" style={{ color: "var(--muted)" }}>You can paste text or upload a TXT, CSV, DOCX, or text-based PDF (up to {MAX_FILE_BYTES / 1024 / 1024} MB). Files are read in your browser and never uploaded.</p>
        <div id="file-msg" role="status" aria-live="polite" className="text-sm">
          {loading && <p className="mt-2"><strong>Reading file…</strong> Large files can take a few seconds.</p>}
          {fileMsg?.kind === "ok" && <p className="mt-2"><strong>✓</strong> {fileMsg.text}</p>}
          {fileMsg?.kind === "error" && <p role="alert" className="mt-2" style={{ color: "var(--danger)" }}><strong>Couldn’t load file:</strong> {fileMsg.text}</p>}
          {pending && (
            <div role="group" aria-label="Confirm replacing text" className="mt-2 rounded-md p-3" style={{ background: "var(--accent-soft)" }}>
              <p><strong>{shortName(pending.name)}</strong> has {fmt(pending.text.length)} characters. This will replace the text currently in the editor. Continue?</p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn" autoFocus onClick={() => setPending(null)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={() => applyFile(pending.name, pending.text)}>Replace</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {options.length > 0 && (
        <fieldset className="mt-4 rounded-md p-3" style={{ border: "1px solid var(--line)" }}>
          <legend className="px-1 text-sm font-semibold">Options</legend>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {options.map((o) =>
              o.type === "checkbox" ? (
                <label key={o.key} className="flex min-h-[2.25rem] items-center gap-2">
                  <input type="checkbox" className="h-5 w-5" checked={!!opts[o.key]} onChange={(e) => setOpts({ ...opts, [o.key]: e.target.checked })} />
                  <span>{o.label}</span>
                </label>
              ) : (
                <label key={o.key} className="flex items-center gap-2">
                  <span>{o.label}</span>
                  <select className="min-h-[2.5rem] rounded-md px-2" style={{ border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}
                    value={String(opts[o.key])} onChange={(e) => setOpts({ ...opts, [o.key]: e.target.value })}>
                    {o.choices.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                </label>
              ),
            )}
          </div>
        </fieldset>
      )}

      <div className="mt-5 flex items-end justify-between gap-3">
        <label htmlFor="result-box" className="font-semibold">{analysis ? "Results" : "Result"}</label>
        {result && result.ok && result.r.stats && <p className="text-right text-sm" style={{ color: "var(--muted)" }}>{result.r.stats}</p>}
      </div>
      <textarea id="result-box" className="field mt-2" readOnly value={output} style={{ minHeight: analysis ? "8rem" : undefined, opacity: stale ? 0.7 : 1 }}
        placeholder="Your result appears here." aria-live="off" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={copy} disabled={!output}>Copy result</button>
        <button type="button" className="btn" onClick={download} disabled={!output}>Download .txt</button>
        {!analysis && <button type="button" className="btn" onClick={() => setText(output)} disabled={!output}>Use result as input</button>}
      </div>

      <div id="tool-msg" role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm">
        {tooBig && <p role="alert" style={{ color: "var(--danger)" }}><strong>Text too large.</strong> This tool handles up to {fmt(MAX_CHARS)} characters in the browser. Split your text into smaller parts and try again.</p>}
        {result && !result.ok && <p role="alert" style={{ color: "var(--danger)" }}><strong>Something went wrong</strong> while processing this text. Try shorter text or reload the page.</p>}
        {result && result.ok && result.r.note && !error && <p style={{ color: "var(--muted)" }}>{result.r.note}</p>}
        {error && <p role="alert" style={{ color: "var(--danger)" }}><strong>Error:</strong> {error}</p>}
        {status && <p><strong>✓</strong> {status}</p>}
        {!text && !tooBig && !status && !error && <p style={{ color: "var(--muted)" }}>Paste or type text above. Results update automatically. Nothing is uploaded.</p>}
      </div>
    </div>
  );
}
