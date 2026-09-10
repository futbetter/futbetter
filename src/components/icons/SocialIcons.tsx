// Lightweight, generic social-network glyphs. lucide-react no longer ships
// brand/logo icons, so these simple stand-ins keep the UI consistent
// without reproducing any brand's specific logo artwork.

type IconProps = { size?: number; className?: string };

export function XIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth={1.6} />
      <path
        d="M13.5 21v-6.5h2.2l.3-2.6h-2.5V10.2c0-.76.2-1.28 1.3-1.28h1.4V6.6c-.24-.03-1.06-.1-2.02-.1-2 0-3.38 1.22-3.38 3.46v1.93H8.5v2.6h2.3V21"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth={1.6} />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.6} />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}
