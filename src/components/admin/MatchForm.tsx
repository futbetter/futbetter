"use client";

import { saveMatch } from "@/lib/actions/matches";

interface MatchFormProps {
  match?: {
    id: string;
    competitionId?: string | null;
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: Date | string;
    venue?: string | null;
    status: string;
    featured: boolean;
    isMatchOfTheDay: boolean;
    preview?: string | null;
    homeForm?: string | null;
    awayForm?: string | null;
    h2hNotes?: string | null;
    keyPlayers?: string[] | null;
    injuries?: string[] | null;
    predictionWinner?: string | null;
    predictionConfidence?: number | null;
    predictionScoreHome?: number | null;
    predictionScoreAway?: number | null;
    predictionReasoning?: string | null;
    predictionFullAnalysis?: string | null;
    predictionKeyFactors?: string[] | null;
    expertName?: string | null;
    expertWinner?: string | null;
    expertConfidence?: number | null;
    votingEnabled: boolean;
    commentsEnabled: boolean;
  };
  teams: { id: string; name: string }[];
  competitions: { id: string; name: string }[];
}

function toLocalDatetime(d?: Date | string) {
  if (!d) return "";
  const date = new Date(d);
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function MatchForm({ match, teams, competitions }: MatchFormProps) {
  return (
    <form action={saveMatch} className="space-y-6">
      {match && <input type="hidden" name="id" value={match.id} />}

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Match Details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Competition">
            <select name="competitionId" defaultValue={match?.competitionId ?? ""} className="input">
              <option value="">None</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Venue">
            <input name="venue" defaultValue={match?.venue ?? ""} className="input" />
          </Field>
          <Field label="Home Team" required>
            <select name="homeTeamId" required defaultValue={match?.homeTeamId ?? ""} className="input">
              <option value="" disabled>Select team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Away Team" required>
            <select name="awayTeamId" required defaultValue={match?.awayTeamId ?? ""} className="input">
              <option value="" disabled>Select team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Kick-off (local time)" required>
            <input
              type="datetime-local"
              name="kickoffAt"
              required
              defaultValue={toLocalDatetime(match?.kickoffAt)}
              className="input"
            />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={match?.status ?? "SCHEDULED"} className="input">
              <option value="SCHEDULED">Scheduled</option>
              <option value="LIVE">Live</option>
              <option value="FINISHED">Finished</option>
              <option value="POSTPONED">Postponed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={match?.featured} className="h-4 w-4" /> Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isMatchOfTheDay" defaultChecked={match?.isMatchOfTheDay} className="h-4 w-4" /> Match of the Day
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="votingEnabled" defaultChecked={match?.votingEnabled ?? true} className="h-4 w-4" /> Voting enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="commentsEnabled" defaultChecked={match?.commentsEnabled ?? true} className="h-4 w-4" /> Comments enabled
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Preview &amp; Analysis</legend>
        <div className="space-y-4">
          <Field label="Preview">
            <textarea name="preview" defaultValue={match?.preview ?? ""} rows={3} className="input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Home form (e.g. WWLDW)">
              <input name="homeForm" defaultValue={match?.homeForm ?? ""} maxLength={5} className="input" />
            </Field>
            <Field label="Away form (e.g. WWLDW)">
              <input name="awayForm" defaultValue={match?.awayForm ?? ""} maxLength={5} className="input" />
            </Field>
          </div>
          <Field label="Head-to-head notes">
            <textarea name="h2hNotes" defaultValue={match?.h2hNotes ?? ""} rows={2} className="input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Key players (one per line)">
              <textarea name="keyPlayers" defaultValue={match?.keyPlayers?.join("\n") ?? ""} rows={3} className="input" />
            </Field>
            <Field label="Injuries / unavailable (one per line)">
              <textarea name="injuries" defaultValue={match?.injuries?.join("\n") ?? ""} rows={3} className="input" />
            </Field>
          </div>
          <Field label="Full analysis (paragraphs)">
            <textarea name="predictionFullAnalysis" defaultValue={match?.predictionFullAnalysis ?? ""} rows={6} className="input" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-brand/40 bg-brand/5 p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-brand">FutBetter Prediction</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Winner">
            <select name="predictionWinner" defaultValue={match?.predictionWinner ?? ""} className="input">
              <option value="">Not set</option>
              <option value="HOME">Home Win</option>
              <option value="DRAW">Draw</option>
              <option value="AWAY">Away Win</option>
            </select>
          </Field>
          <Field label="Confidence (%)">
            <input type="number" min={0} max={100} name="predictionConfidence" defaultValue={match?.predictionConfidence ?? ""} className="input" />
          </Field>
          <Field label="Predicted Score">
            <div className="flex items-center gap-2">
              <input type="number" min={0} name="predictionScoreHome" defaultValue={match?.predictionScoreHome ?? ""} className="input" />
              <span>–</span>
              <input type="number" min={0} name="predictionScoreAway" defaultValue={match?.predictionScoreAway ?? ""} className="input" />
            </div>
          </Field>
        </div>
        <Field label="Short reasoning">
          <textarea name="predictionReasoning" defaultValue={match?.predictionReasoning ?? ""} rows={2} className="input" />
        </Field>
        <Field label="Key factors (one per line)">
          <textarea name="predictionKeyFactors" defaultValue={match?.predictionKeyFactors?.join("\n") ?? ""} rows={3} className="input" />
        </Field>
      </fieldset>

      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Expert Prediction (optional)</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Expert name">
            <input name="expertName" defaultValue={match?.expertName ?? ""} className="input" />
          </Field>
          <Field label="Winner">
            <select name="expertWinner" defaultValue={match?.expertWinner ?? ""} className="input">
              <option value="">Not set</option>
              <option value="HOME">Home Win</option>
              <option value="DRAW">Draw</option>
              <option value="AWAY">Away Win</option>
            </select>
          </Field>
          <Field label="Confidence (%)">
            <input type="number" min={0} max={100} name="expertConfidence" defaultValue={match?.expertConfidence ?? ""} className="input" />
          </Field>
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
        <button type="submit" className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-dark">
          Save Match
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="mb-4 block last:mb-0">
      <span className="mb-1 block text-xs font-semibold text-muted">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
    </label>
  );
}
