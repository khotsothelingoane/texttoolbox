"use client";
import Link from "next/link";
import { useState } from "react";
type Item = { slug: string; name: string; short: string };
export default function ToolSearch({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const hits = query ? items.filter((i) => (i.name + " " + i.short).toLowerCase().includes(query)) : [];
  return (
    <div className="mt-6 max-w-xl">
      <label htmlFor="tool-search" className="font-semibold">Find a tool</label>
      <input id="tool-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. duplicate, uppercase, word count"
        className="mt-1 min-h-[3rem] w-full rounded-md px-3 text-base" style={{ border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}
        aria-controls="tool-search-results" autoComplete="off" />
      <div id="tool-search-results" aria-live="polite">
        {query && (hits.length ? (
          <ul className="card mt-2 divide-y">{hits.map((t) => (<li key={t.slug}><Link href={`/${t.slug}`} className="tool-link"><strong>{t.name}</strong><span>{t.short}</span></Link></li>))}</ul>
        ) : (<p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>No tools match “{q}”. Try a different word.</p>))}
      </div>
    </div>
  );
}
