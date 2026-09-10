import { PartnerForm } from "@/components/admin/PartnerForm";

export const metadata = { title: "New Partner" };

export default function NewPartnerPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">New Partner</h1>
      <PartnerForm />
    </div>
  );
}
