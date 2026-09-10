import { saveTeam } from "@/lib/actions/teams";

interface TeamFormProps {
  team?: {
    id: string;
    name: string;
    shortName?: string | null;
    slug: string;
    country?: string | null;
    logoUrl?: string | null;
    primaryColor: string;
    secondaryColor: string;
    competitionId?: string | null;
    foundedYear?: number | null;
    description?: string | null;
    website?: string | null;
  };
  competitions: { id: string; name: string }[];
}

export function TeamForm({ team, competitions }: TeamFormProps) {
  return (
    <form action={saveTeam} className="space-y-4">
      {team && <input type="hidden" name="id" value={team.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <input name="name" required defaultValue={team?.name ?? ""} className="input" />
        </Field>
        <Field label="Short name">
          <input name="shortName" defaultValue={team?.shortName ?? ""} className="input" />
        </Field>
        <Field label="Slug (auto if blank)">
          <input name="slug" defaultValue={team?.slug ?? ""} className="input" />
        </Field>
        <Field label="Country">
          <input name="country" defaultValue={team?.country ?? ""} className="input" />
        </Field>
        <Field label="Competition">
          <select name="competitionId" defaultValue={team?.competitionId ?? ""} className="input">
            <option value="">None</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Founded year">
          <input type="number" name="foundedYear" defaultValue={team?.foundedYear ?? ""} className="input" />
        </Field>
        <Field label="Logo URL">
          <input name="logoUrl" placeholder="https://… (leave blank to use a placeholder badge)" defaultValue={team?.logoUrl ?? ""} className="input" />
        </Field>
        <Field label="Website">
          <input name="website" defaultValue={team?.website ?? ""} className="input" />
        </Field>
        <Field label="Primary color">
          <input type="color" name="primaryColor" defaultValue={team?.primaryColor ?? "#22c55e"} className="h-10 w-full rounded-lg border border-border bg-surface-2" />
        </Field>
        <Field label="Secondary color">
          <input type="color" name="secondaryColor" defaultValue={team?.secondaryColor ?? "#111111"} className="h-10 w-full rounded-lg border border-border bg-surface-2" />
        </Field>
      </div>

      <Field label="Description">
        <textarea name="description" defaultValue={team?.description ?? ""} rows={3} className="input" />
      </Field>

      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
          Save Team
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
