import Link from "next/link";
import { bySlug } from "@/lib/tools";
export default function RelatedTools({ slugs, title = "Related tools" }: { slugs: string[]; title?: string }) {
  const list = slugs.map(bySlug).filter((t): t is NonNullable<ReturnType<typeof bySlug>> => !!t);
  return (
    <section aria-labelledby="related-h">
      <h2 id="related-h">{title}</h2>
      <ul className="card mt-3 grid divide-y sm:grid-cols-2 sm:divide-y-0" style={{ borderColor: "var(--line)" }}>
        {list.map((t) => (
          <li key={t.slug}><Link href={`/${t.slug}`} className="tool-link"><strong>{t.name}</strong><span>{t.short}</span></Link></li>
        ))}
      </ul>
    </section>
  );
}
