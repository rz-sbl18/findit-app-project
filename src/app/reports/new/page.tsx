import { requireUserPage } from "@/lib/guards";
import { ReportForm } from "@/components/ReportForm";

export default async function NewReport() {
  await requireUserPage();
  return <ReportForm />;
}
