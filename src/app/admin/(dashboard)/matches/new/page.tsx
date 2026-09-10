import { MatchForm } from "@/components/admin/MatchForm";
import { getTeams, getCompetitions } from "@/lib/queries";

export const metadata = { title: "New Match" };

export default async function NewMatchPage() {
  const [teams, competitions] = await Promise.all([getTeams(), getCompetitions()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">New Match</h1>
      <MatchForm teams={teams} competitions={competitions} />
    </div>
  );
}
