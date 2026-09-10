import { savePartner } from "@/lib/actions/partners";

interface PartnerFormProps {
  partner?: {
    id: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    ctaText: string;
    referralUrl: string;
    trackingUrl?: string | null;
    campaignId?: string | null;
    country: string;
    placement: string;
    packageTier: string;
    active: boolean;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
  };
}

function toDateInput(d?: Date | string | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export function PartnerForm({ partner }: PartnerFormProps) {
  return (
    <form action={savePartner} className="space-y-4">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Partner name" required>
          <input name="name" required defaultValue={partner?.name ?? ""} className="input" />
        </Field>
        <Field label="Logo URL">
          <input name="logo" defaultValue={partner?.logo ?? ""} className="input" />
        </Field>
        <Field label="Referral URL" required>
          <input name="referralUrl" required placeholder="https://partner.com/ref=futbetter" defaultValue={partner?.referralUrl ?? ""} className="input" />
        </Field>
        <Field label="Tracking URL">
          <input name="trackingUrl" defaultValue={partner?.trackingUrl ?? ""} className="input" />
        </Field>
        <Field label="Campaign ID">
          <input name="campaignId" defaultValue={partner?.campaignId ?? ""} className="input" />
        </Field>
        <Field label="CTA text">
          <input name="ctaText" defaultValue={partner?.ctaText ?? "Learn more"} className="input" />
        </Field>
        <Field label="Country / Region">
          <input name="country" defaultValue={partner?.country ?? "Global"} className="input" />
        </Field>
        <Field label="Placement">
          <select name="placement" defaultValue={partner?.placement ?? "sidebar"} className="input">
            <option value="sidebar">Sidebar</option>
            <option value="homepage">Homepage</option>
            <option value="match_page">Match Page</option>
            <option value="article">Article</option>
            <option value="footer">Footer</option>
          </select>
        </Field>
        <Field label="Package tier">
          <select name="packageTier" defaultValue={partner?.packageTier ?? "BASIC"} className="input">
            <option value="BASIC">Basic</option>
            <option value="MATCH_SPONSOR">Match Sponsor</option>
            <option value="PREMIUM">Premium</option>
            <option value="EXCLUSIVE_PARTNER">Exclusive Partner</option>
          </select>
        </Field>
        <Field label="Start date">
          <input type="date" name="startDate" defaultValue={toDateInput(partner?.startDate)} className="input" />
        </Field>
        <Field label="End date">
          <input type="date" name="endDate" defaultValue={toDateInput(partner?.endDate)} className="input" />
        </Field>
      </div>

      <Field label="Description">
        <textarea name="description" defaultValue={partner?.description ?? ""} rows={3} className="input" />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={partner?.active ?? true} className="h-4 w-4" /> Active
      </label>

      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
          Save Partner
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
    </label>
  );
}
