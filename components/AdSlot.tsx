import { ADSENSE } from "@/lib/site";

/**
 * Reserved ad position. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT is set, so
 * visitors never see empty boxes or fake ads. Once configured, pass a real ad unit
 * id via the `slot` prop (created in your AdSense account).
 */
export default function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  if (!ADSENSE || !slot) return null;
  return (
    <aside aria-label="Advertisement" className={`my-6 ${className}`}>
      <p className="mb-1 text-xs" style={{ color: "var(--muted)" }}>Advertisement</p>
      <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={ADSENSE} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
