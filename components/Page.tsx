export default function Page({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="wrap py-8 sm:py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      {updated && <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Last updated: {updated}</p>}
      <div className="prose-tt mt-4">{children}</div>
    </div>
  );
}
