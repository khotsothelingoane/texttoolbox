import Link from "next/link";
import type { Metadata } from "next";
import { categories, tools } from "@/lib/tools";
import { SITE_NAME, SITE_URL, SUPPORT, TAGLINE, pageMeta } from "@/lib/site";
import ToolSearch from "@/components/ToolSearch";
import Faq from "@/components/Faq";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({ title: `${TAGLINE} – Clean, Convert & Count Text | ${SITE_NAME}`, description: "Free online text tools: remove duplicate lines, change case, count words, extract emails and more. Instant, private, no signup.", path: "/" });

const faqs = [
  { q: "Are these text tools really free?", a: "Yes. Every tool is free to use with no signup, no account and no limit on how often you use it." },
  { q: "Is my text uploaded to a server?", a: "No. Text is processed by your browser on your own device. The website does not receive what you paste into the tools." },
  { q: "Do I need to install anything?", a: "No. The tools work in any modern browser on phones, tablets and computers." },
  { q: "How much text can I paste?", a: "Up to 5 million characters per tool, which is far more than most documents. Very large text may be slower on older phones." },
  { q: "Can I use the results anywhere?", a: "Yes. Copy the result or download it as a .txt file and use it however you like." },
];

export default function Home() {
  const search = tools.map((t) => ({ slug: t.slug, name: t.name, short: t.short }));
  const popular = tools.filter((t) => t.popular);
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ] };
  return (
    <>
      <JsonLd data={ld} />
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap py-10 sm:py-14">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{TAGLINE}</h1>
          <p className="mt-3 max-w-2xl text-lg" style={{ color: "var(--muted)" }}>{SUPPORT}</p>
          <ToolSearch items={search} />
        </div>
      </section>

      <div className="wrap py-10">
        <section aria-labelledby="popular-h">
          <h2 id="popular-h" className="text-2xl font-bold">Popular tools</h2>
          <ul className="card mt-4 grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
            {popular.map((t) => (<li key={t.slug}><Link href={`/${t.slug}`} className="tool-link"><strong>{t.name}</strong><span>{t.short}</span></Link></li>))}
          </ul>
        </section>

        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT} />

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {categories.map((c) => (
            <section key={c} id={c.toLowerCase().replace(/\s+/g, "-")} aria-labelledby={`${c}-h`} style={{ scrollMarginTop: "1rem" }}>
              <h2 id={`${c}-h`} className="text-xl font-bold">{c}</h2>
              <ul className="card mt-3 divide-y">
                {tools.filter((t) => t.category === c).map((t) => (<li key={t.slug}><Link href={`/${t.slug}`} className="tool-link"><strong>{t.name}</strong><span>{t.short}</span></Link></li>))}
              </ul>
            </section>
          ))}
        </div>

        <section className="prose-tt mt-12" aria-labelledby="why-h">
          <h2 id="why-h">Why use {SITE_NAME}?</h2>
          <ul>
            <li><strong>Free.</strong> No payment, no trial, no hidden limits.</li>
            <li><strong>No signup.</strong> Open a tool and start. There are no accounts.</li>
            <li><strong>Fast.</strong> Results appear as you type, without page reloads.</li>
            <li><strong>Works in your browser.</strong> Nothing to install.</li>
            <li><strong>Private by design.</strong> Text is processed on your device and is not sent to our server. Read the <Link href="/privacy">privacy page</Link> for details.</li>
            <li><strong>Works everywhere.</strong> Layouts are built for phones, tablets and computers.</li>
          </ul>
        </section>

        <div className="prose-tt mt-12"><Faq items={faqs} /></div>
        <div className="mt-12"><RelatedTools title="Start with these" slugs={["remove-duplicate-lines", "word-counter", "title-case-converter", "extract-emails"]} /></div>
      </div>
    </>
  );
}
