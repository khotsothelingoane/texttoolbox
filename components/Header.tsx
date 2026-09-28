import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export default function Header() {
  return (
    <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link href="/" className="text-xl font-bold no-underline" style={{ color: "var(--ink)" }}>
          Text<span style={{ color: "var(--accent)" }}>Toolbox</span>
          <span className="sr-only"> – {SITE_NAME} home</span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
          <Link href="/#text-cleaning">Clean</Link>
          <Link href="/#text-formatting">Format</Link>
          <Link href="/#text-analysis">Analyze</Link>
          <Link href="/#text-extraction">Extract</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
