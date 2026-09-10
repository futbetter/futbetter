import { initials } from "@/lib/utils";

interface TeamBadgeProps {
  name: string;
  logoUrl?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
}

export function TeamBadge({ name, logoUrl, color, size = 40, className }: TeamBadgeProps) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied logo URLs can't be pre-configured for next/image domain allowlisting
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-contain bg-white/5 ${className ?? ""}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const bg = color || "#1a1a1a";

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shrink-0 ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${bg}, #000)`,
        fontSize: size * 0.36,
        border: "1px solid rgba(255,255,255,0.15)",
      }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}
