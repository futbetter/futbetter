import type { Metadata } from "next";
import { Mail, Send, Music2 } from "lucide-react";
import { XIcon, InstagramIcon } from "@/components/icons/SocialIcons";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the FutBetter team.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-3 text-3xl font-black">Contact</h1>
      <p className="mb-8 text-sm text-muted">
        Questions, feedback, partnership or advertising enquiries — we&apos;d love to hear from you.
      </p>

      <div className="space-y-3">
        <ContactRow icon={<Mail size={18} />} label={settings.contactEmail} href={`mailto:${settings.contactEmail}`} />
        <ContactRow icon={<Send size={18} />} label="Telegram Channel" href={settings.socialTelegram} />
        <ContactRow icon={<InstagramIcon size={18} />} label="Instagram" href={settings.socialInstagram} />
        <ContactRow icon={<XIcon size={18} />} label="X (Twitter)" href={settings.socialX} />
        <ContactRow icon={<Music2 size={18} />} label="TikTok" href={settings.socialTiktok} />
      </div>

      <p className="mt-8 text-xs text-muted">
        Looking to advertise or sponsor a match? Visit our{" "}
        <a href="/advertise" className="text-brand hover:underline">Advertise</a> page for packages and audience stats.
      </p>
    </div>
  );
}

function ContactRow({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="card card-hover flex items-center gap-3 p-4"
    >
      <span className="text-brand">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
}
