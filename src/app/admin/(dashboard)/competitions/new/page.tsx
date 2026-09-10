import { CompetitionForm } from "@/components/admin/CompetitionForm";

export const metadata = { title: "New Competition" };

export default function NewCompetitionPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">New Competition</h1>
      <CompetitionForm />
    </div>
  );
}
