import { getActiveAd } from "@/lib/ads";

export async function AdSlot({ code, className }: { code: string; className?: string }) {
  const ad = await getActiveAd(code);
  if (!ad) return null;

  const clickHref = `/api/ads/${ad.id}/click`;

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-surface-2 ${className ?? ""}`}>
      <a href={clickHref} target="_blank" rel="noreferrer sponsored" className="block">
        {ad.html ? (
          <div dangerouslySetInnerHTML={{ __html: ad.html }} />
        ) : ad.desktopImageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.desktopImageUrl}
              alt={ad.name}
              className="hidden w-full object-cover sm:block"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.mobileImageUrl ?? ad.desktopImageUrl}
              alt={ad.name}
              className="block w-full object-cover sm:hidden"
            />
          </>
        ) : (
          <div className="flex h-16 items-center justify-center text-xs font-semibold text-muted">
            Advertise here — {code}
          </div>
        )}
      </a>
      <p className="px-2 py-1 text-center text-[9px] uppercase tracking-wider text-muted">
        Advertisement
      </p>
    </div>
  );
}
