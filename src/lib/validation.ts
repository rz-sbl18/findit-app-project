import { z } from "zod";
import { CATEGORIES, REPORT_TYPES, STATUSES } from "./constants";

// Tolak karakter < dan > pada teks bebas (defense in depth terhadap XSS; output tetap di-encode oleh React).
const safeText = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} minimal ${min} karakter`)
    .max(max, `${label} maksimal ${max} karakter`)
    // eslint-disable-next-line no-control-regex
    .refine((v) => !/[<>]/.test(v) && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(v), `${label} mengandung karakter yang tidak diizinkan`);

export const registerSchema = z
  .object({
    full_name: safeText(2, 100, "Nama"),
    email: z.string().trim().toLowerCase().email("Email tidak valid").max(254),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(72, "Password maksimal 72 karakter")
      .regex(/[A-Za-z]/, "Password harus memuat huruf")
      .regex(/[0-9]/, "Password harus memuat angka"),
    confirm_password: z.string(),
  })
  .strict()
  .refine((d) => d.password === d.confirm_password, { path: ["confirm_password"], message: "Konfirmasi password tidak cocok" });

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email tidak valid").max(254),
    password: z.string().min(1).max(72),
  })
  .strict();

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal tidak valid")
  .refine((v) => Date.parse(v) <= Date.now() + 24 * 3600 * 1000, "Tanggal tidak boleh di masa depan");

export const reportFields = {
  item_name: safeText(2, 120, "Nama barang"),
  category: z.enum(CATEGORIES),
  description: safeText(5, 2000, "Deskripsi"),
  location: safeText(2, 200, "Lokasi"),
  incident_date: dateStr,
  contact_info: safeText(0, 200, "Kontak").optional().or(z.literal("")),
  share_contact: z.boolean(),
};

export const createReportSchema = z
  .object({ ...reportFields, report_type: z.enum(REPORT_TYPES) })
  .strict();

// PATCH: hanya field ini yang boleh diubah (mass-assignment protection). user_id, role, is_active tidak ada di sini.
export const updateReportSchema = z
  .object({
    item_name: reportFields.item_name.optional(),
    category: reportFields.category.optional(),
    description: reportFields.description.optional(),
    location: reportFields.location.optional(),
    incident_date: reportFields.incident_date.optional(),
    contact_info: reportFields.contact_info,
    share_contact: reportFields.share_contact.optional(),
    status: z.enum(STATUSES).optional(),
  })
  .strict();

export const adminModerateSchema = z.object({ is_active: z.boolean() }).strict();

export const uuidSchema = z.string().uuid();

/** Bersihkan kata kunci pencarian agar tidak bisa menyisipkan sintaks filter PostgREST. */
export function sanitizeSearch(q: string): string {
  return q.replace(/[^\p{L}\p{N} \-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Input tidak valid";
}
