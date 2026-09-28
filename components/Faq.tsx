export default function Faq({ items, title = "Frequently asked questions" }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <section aria-labelledby="faq-h">
      <h2 id="faq-h">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((f) => (
          <details key={f.q} className="card px-4 py-3">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2" style={{ color: "var(--muted)" }}>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
