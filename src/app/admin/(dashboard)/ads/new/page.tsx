import { AdSlotForm } from "@/components/admin/AdSlotForm";

export const metadata = { title: "New Ad Slot" };

export default function NewAdSlotPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">New Ad Slot</h1>
      <AdSlotForm />
    </div>
  );
}
