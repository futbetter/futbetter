import { TeamForm } from "@/components/admin/TeamForm";
import { getCompetitions } from "@/lib/queries";

export const metadata = { title: "New Team" };

export default async function NewTeamPage() {
  const competitions = await getCompetitions();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">New Team</h1>
      <TeamForm competitions={competitions} />
    </div>
  );
}
