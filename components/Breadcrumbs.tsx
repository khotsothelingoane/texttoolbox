import Link from "next/link";
export type Crumb = { name: string; href?: string };
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm" style={{ color: "var(--muted)" }}>
      <ol className="flex flex-wrap gap-x-2">
        {items.map((c, i) => (
          <li key={c.name} className="flex gap-x-2">
            {c.href ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
            {i < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
