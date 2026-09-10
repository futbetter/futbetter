import { getSiteSettings } from "@/lib/settings";
import { saveSiteSettings } from "@/lib/actions/settings";
import { auth } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Site Settings</h1>

      {!isSuperAdmin && (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          Only Super Admin can change site-wide settings. You can view the current values below.
        </p>
      )}

      <form action={saveSiteSettings} className="space-y-6">
        <fieldset className="rounded-lg border border-border p-4" disabled={!isSuperAdmin}>
          <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Brand</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site name">
              <input name="siteName" defaultValue={settings.siteName} className="input" />
            </Field>
            <Field label="Contact email">
              <input name="contactEmail" defaultValue={settings.contactEmail} className="input" />
            </Field>
            <Field label="Slogan">
              <input name="slogan" defaultValue={settings.slogan} className="input" />
            </Field>
            <Field label="Hero text">
              <input name="heroText" defaultValue={settings.heroText} className="input" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-border p-4" disabled={!isSuperAdmin}>
          <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Social &amp; Telegram</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telegram channel URL">
              <input name="socialTelegram" defaultValue={settings.socialTelegram} className="input" />
            </Field>
            <Field label="Telegram login bot username">
              <input name="telegramBotUsername" defaultValue={settings.telegramBotUsername} className="input" />
            </Field>
            <Field label="Instagram URL">
              <input name="socialInstagram" defaultValue={settings.socialInstagram} className="input" />
            </Field>
            <Field label="X (Twitter) URL">
              <input name="socialX" defaultValue={settings.socialX} className="input" />
            </Field>
            <Field label="TikTok URL">
              <input name="socialTiktok" defaultValue={settings.socialTiktok} className="input" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-border p-4" disabled={!isSuperAdmin}>
          <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Advertise Page Stats</legend>
          <p className="mb-3 text-xs text-muted">Shown on the public /advertise page. Update these with real numbers.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Monthly users">
              <input type="number" name="monthlyUsers" defaultValue={settings.monthlyUsers} className="input" />
            </Field>
            <Field label="Monthly page views">
              <input type="number" name="monthlyPageViews" defaultValue={settings.monthlyPageViews} className="input" />
            </Field>
            <Field label="Telegram audience">
              <input type="number" name="telegramAudience" defaultValue={settings.telegramAudience} className="input" />
            </Field>
            <Field label="Social reach">
              <input type="number" name="socialReach" defaultValue={settings.socialReach} className="input" />
            </Field>
          </div>
        </fieldset>

        {isSuperAdmin && (
          <div className="flex justify-end">
            <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
              Save Settings
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
