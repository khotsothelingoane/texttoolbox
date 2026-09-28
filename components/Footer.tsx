import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function Footer() {
  const popular = tools.filter((t) => t.popular).slice(0, 8);
  return (
    <footer className="mt-16" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
      <div className="wrap grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p className="font-bold">{SITE_NAME}</p>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Free text tools that run in your browser. Your text is not uploaded or stored.</p>
        </div>
        <nav aria-label="Popular tools">
          <p className="font-bold">Popular tools</p>
          <ul className="mt-2 space-y-1 text-sm">
            {popular.map((t) => (<li key={t.slug}><Link href={`/${t.slug}`}>{t.name}</Link></li>))}
          </ul>
        </nav>
        <nav aria-label="Site">
          <p className="font-bold">Site</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/about">About</Link></li><li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li><li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>
      <p className="wrap pb-8 text-sm" style={{ color: "var(--muted)" }}>© {new Date().getFullYear()} {SITE_NAME}</p>
    </footer>
  );
}
