import { saveAdSlot } from "@/lib/actions/ads";
import { AD_SLOT_CODES } from "@/lib/ads";

interface AdSlotFormProps {
  adSlot?: {
    id: string;
    code: string;
    name: string;
    enabled: boolean;
    format: string;
    desktopImageUrl?: string | null;
    mobileImageUrl?: string | null;
    html?: string | null;
    url?: string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
  };
}

function toDateInput(d?: Date | string | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export function AdSlotForm({ adSlot }: AdSlotFormProps) {
  return (
    <form action={saveAdSlot} className="space-y-4">
      {adSlot && <input type="hidden" name="id" value={adSlot.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slot code" required>
          <input name="code" required list="ad-slot-codes" defaultValue={adSlot?.code ?? ""} className="input" />
          <datalist id="ad-slot-codes">
            {AD_SLOT_CODES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Name" required>
          <input name="name" required defaultValue={adSlot?.name ?? ""} className="input" />
        </Field>
        <Field label="Format">
          <select name="format" defaultValue={adSlot?.format ?? "banner"} className="input">
            <option value="banner">Banner</option>
            <option value="native">Native</option>
            <option value="sponsored_article">Sponsored Article</option>
            <option value="video">Video</option>
            <option value="sidebar">Sidebar</option>
            <option value="mobile_sticky">Mobile Sticky</option>
          </select>
        </Field>
        <Field label="Target URL">
          <input name="url" placeholder="https://…" defaultValue={adSlot?.url ?? ""} className="input" />
        </Field>
        <Field label="Desktop image URL">
          <input name="desktopImageUrl" defaultValue={adSlot?.desktopImageUrl ?? ""} className="input" />
        </Field>
        <Field label="Mobile image URL">
          <input name="mobileImageUrl" defaultValue={adSlot?.mobileImageUrl ?? ""} className="input" />
        </Field>
        <Field label="Start date">
          <input type="date" name="startDate" defaultValue={toDateInput(adSlot?.startDate)} className="input" />
        </Field>
        <Field label="End date">
          <input type="date" name="endDate" defaultValue={toDateInput(adSlot?.endDate)} className="input" />
        </Field>
      </div>

      <Field label="Custom HTML creative (optional — overrides images)">
        <textarea name="html" defaultValue={adSlot?.html ?? ""} rows={4} className="input font-mono text-xs" />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={adSlot?.enabled ?? false} className="h-4 w-4" /> Enabled
      </label>

      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
          Save Ad Slot
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
