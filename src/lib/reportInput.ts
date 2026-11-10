import { NextRequest } from "next/server";

/** Baca body JSON atau multipart menjadi objek biasa + file opsional. */
export async function readReportBody(req: NextRequest): Promise<{ data: Record<string, unknown> | null; file: File | null }> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return { data: null, file: null };
    const data: Record<string, unknown> = {};
    let file: File | null = null;
    for (const [k, v] of form.entries()) {
      if (k === "image") {
        if (typeof v !== "string" && v.size > 0) file = v;
      } else if (typeof v === "string") {
        data[k] = k === "share_contact" ? v === "true" : v;
      }
    }
    return { data, file };
  }
  const json = await req.json().catch(() => null);
  return { data: json && typeof json === "object" ? (json as Record<string, unknown>) : null, file: null };
}
