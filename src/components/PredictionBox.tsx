import { TrendingUp, Users } from "lucide-react";
import type { VoteTally } from "@/lib/actions/votes";

interface PredictionBoxProps {
  homeTeamName: string;
  awayTeamName: string;
  tally: VoteTally;
  predictionWinner?: "HOME" | "DRAW" | "AWAY" | null;
  predictionConfidence?: number | null;
  predictionScoreHome?: number | null;
  predictionScoreAway?: number | null;
  predictionReasoning?: string | null;
  predictionKeyFactors?: string[] | null;
  expertName?: string | null;
  expertWinner?: "HOME" | "DRAW" | "AWAY" | null;
  expertConfidence?: number | null;
}

function winnerLabel(
  winner: "HOME" | "DRAW" | "AWAY" | null | undefined,
  home: string,
  away: string
) {
  if (winner === "HOME") return `${home} Win`;
  if (winner === "AWAY") return `${away} Win`;
  if (winner === "DRAW") return "Draw";
  return "Not set yet";
}

export function PredictionBox({
  homeTeamName,
  awayTeamName,
  tally,
  predictionWinner,
  predictionConfidence,
  predictionScoreHome,
  predictionScoreAway,
  predictionReasoning,
  predictionKeyFactors,
  expertName,
  expertWinner,
  expertConfidence,
}: PredictionBoxProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
          <Users size={14} /> Community Prediction
        </div>
        <div className="space-y-2 text-sm">
          <PctRow label={homeTeamName} pct={tally.homePct} />
          <PctRow label="Draw" pct={tally.drawPct} />
          <PctRow label={awayTeamName} pct={tally.awayPct} />
        </div>
        <p className="mt-2 text-[11px] text-muted">{tally.total.toLocaleString()} votes</p>
      </div>

      {predictionWinner && (
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
              <TrendingUp size={14} /> FutBetter Prediction
            </div>
            {predictionConfidence != null && (
              <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-black text-black">
                {predictionConfidence}%
              </span>
            )}
          </div>
          <p className="text-lg font-black">
            {winnerLabel(predictionWinner, homeTeamName, awayTeamName)}
          </p>
          {predictionScoreHome != null && predictionScoreAway != null && (
            <p className="text-sm text-muted">
              Predicted score:{" "}
              <span className="font-bold text-foreground">
                {predictionScoreHome} – {predictionScoreAway}
              </span>
            </p>
          )}
          {predictionReasoning && (
            <p className="mt-2 text-sm text-muted">{predictionReasoning}</p>
          )}
          {predictionKeyFactors && predictionKeyFactors.length > 0 && (
            <ul className="mt-3 space-y-1">
              {predictionKeyFactors.map((f, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-muted">
                  <span className="text-brand">•</span> {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {expertWinner && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Expert Prediction {expertName ? `— ${expertName}` : ""}
            </span>
            {expertConfidence != null && (
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold">
                {expertConfidence}%
              </span>
            )}
          </div>
          <p className="text-sm font-bold">{winnerLabel(expertWinner, homeTeamName, awayTeamName)}</p>
        </div>
      )}

      <a
        href="https://stake.com/?c=bo4ixMU7"
        target="_blank"
        rel="noopener sponsored"
        className="group block rounded-xl border border-[#00e701]/30 bg-gradient-to-br from-surface to-surface-2 p-4 transition hover:border-[#00e701] hover:shadow-[0_0_20px_rgba(0,231,1,0.15)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00e701]">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#00e701] text-[11px] font-black text-black">
              S
            </span>
            Official Betting Partner
          </div>
          <span className="text-xs font-bold text-[#00e701] transition-transform group-hover:translate-x-0.5">
            Bet Now ↗
          </span>
        </div>
        <p className="mt-2 text-sm font-bold">
          Back your prediction on Stake
        </p>
        <p className="text-xs text-muted">
          Best odds, live betting &amp; instant crypto/fiat payouts
        </p>
      </a>
    </div>
  );
}

function PctRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
