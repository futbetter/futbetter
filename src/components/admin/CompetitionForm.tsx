import { saveCompetition } from "@/lib/actions/competitions";

interface CompetitionFormProps {
  competition?: {
    id: string;
    name: string;
    slug: string;
    country?: string | null;
    type: string;
    season?: string | null;
    logoUrl?: string | null;
    description?: string | null;
  };
}

export function CompetitionForm({ competition }: CompetitionFormProps) {
  return (
    <form action={saveCompetition} className="space-y-4">
      {competition && <input type="hidden" name="id" value={competition.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <input name="name" required defaultValue={competition?.name ?? ""} className="input" />
        </Field>
        <Field label="Slug (auto if blank)">
          <input name="slug" defaultValue={competition?.slug ?? ""} className="input" />
        </Field>
        <Field label="Country">
          <input name="country" defaultValue={competition?.country ?? ""} className="input" />
        </Field>
        <Field label="Type">
          <select name="type" defaultValue={competition?.type ?? "league"} className="input">
            <option value="league">League</option>
            <option value="cup">Cup</option>
            <option value="international">International</option>
          </select>
        </Field>
        <Field label="Season">
          <input name="season" placeholder="2026/27" defaultValue={competition?.season ?? ""} className="input" />
        </Field>
        <Field label="Logo URL">
          <input name="logoUrl" defaultValue={competition?.logoUrl ?? ""} className="input" />
        </Field>
      </div>
      <Field label="Description">
        <textarea name="description" defaultValue={competition?.description ?? ""} rows={3} className="input" />
      </Field>
      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
          Save Competition
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
