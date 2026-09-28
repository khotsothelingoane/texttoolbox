import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bySlug, exampleOut, tools } from "@/lib/tools";
import { SITE_NAME, SITE_URL, pageMeta } from "@/lib/site";
import ToolRunner from "@/components/ToolRunner";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";

export const dynamicParams = false;
export function generateStaticParams() { return tools.map((t) => ({ slug: t.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = bySlug(slug);
  if (!t) return {};
  return pageMeta({ title: t.title, description: t.description, path: `/${t.slug}` });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = bySlug(slug);
  if (!t) notFound();
  const out = exampleOut(t);
  const analysis = t.category === "Text Analysis";
  const url = `${SITE_URL}/${t.slug}`;
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: t.name, url, description: t.description, applicationCategory: "UtilitiesApplication", operatingSystem: "Any (web browser)", inLanguage: "en", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: t.category, item: `${SITE_URL}/#${t.category.toLowerCase().replace(/\s+/g, "-")}` },
      { "@type": "ListItem", position: 3, name: t.name, item: url } ] },
    { "@type": "FAQPage", mainEntity: t.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ] };
  return (
    <div className="wrap py-6 sm:py-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: t.category, href: `/#${t.category.toLowerCase().replace(/\s+/g, "-")}` }, { name: t.name }]} />
      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t.h1}</h1>
      <p className="mt-2 max-w-3xl text-lg" style={{ color: "var(--muted)" }}>{t.intro}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <ToolRunner slug={t.slug} placeholder={t.placeholder} options={t.options} exampleIn={t.exampleIn} fileName={t.fileName} analysis={analysis} />
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Private: your text is processed in your browser and is never sent to our server.</p>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_TOOL} />

          <article className="prose-tt mt-8">
            <h2>What the {t.name.toLowerCase().replace(" a–z / z–a", "")} tool does</h2>
            {t.what.map((p) => (<p key={p}>{p}</p>))}

            <h2>How to use it</h2>
            <ol>{t.steps.map((s) => (<li key={s}>{s}</li>))}</ol>

            <h2>Example</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <figure><figcaption className="mb-1 text-sm font-semibold">Before</figcaption><pre className="card overflow-x-auto p-3 text-sm whitespace-pre-wrap break-words">{t.exampleIn}</pre></figure>
              <figure><figcaption className="mb-1 text-sm font-semibold">After</figcaption><pre className="card overflow-x-auto p-3 text-sm whitespace-pre-wrap break-words">{out || "(empty)"}</pre></figure>
            </div>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT} />

            <h2>Common uses</h2>
            <ul>{t.useCases.map((u) => (<li key={u}>{u}</li>))}</ul>

            <div className="mt-8"><Faq items={t.faqs} title={`${t.name} FAQ`} /></div>
          </article>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start" aria-label="Sidebar">
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} className="hidden lg:block" />
          <nav aria-label="Related tools" className="hidden lg:block">
            <h2 className="text-lg font-bold">Related tools</h2>
            <ul className="card mt-2 divide-y">
              {t.related.map((r) => { const rt = bySlug(r); return rt ? (<li key={r}><a href={`/${r}`} className="tool-link"><strong>{rt.name}</strong></a></li>) : null; })}
            </ul>
          </nav>
        </aside>
      </div>

      <div className="mt-10 lg:hidden"><RelatedTools slugs={t.related} /></div>
    </div>
  );
}
