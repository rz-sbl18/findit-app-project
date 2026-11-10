import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/guards";
import { getReport } from "@/lib/data";
import { uuidSchema } from "@/lib/validation";
import { ReportForm } from "@/components/ReportForm";

export default async function EditReport({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUserPage();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const r = await getReport(id, { viewerId: user.id });
  if (!r || r.user_id !== user.id) notFound(); // bukan milik sendiri -> 404
  return <ReportForm report={r} />;
}
