export const CATEGORIES = [
  "Elektronik",
  "Dokumen",
  "Aksesori",
  "Tas",
  "Pakaian",
  "Peralatan kuliah",
  "Lainnya",
] as const;

export const STATUSES = ["HILANG", "DITEMUKAN", "SELESAI"] as const;
export const REPORT_TYPES = ["LOST", "FOUND"] as const;

export const STATUS_LABEL: Record<string, string> = {
  HILANG: "Hilang",
  DITEMUKAN: "Ditemukan",
  SELESAI: "Selesai",
};
export const TYPE_LABEL: Record<string, string> = { LOST: "Barang Hilang", FOUND: "Barang Ditemukan" };

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const PAGE_SIZE = 12;

export type Report = {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  description: string;
  report_type: "LOST" | "FOUND";
  location: string;
  incident_date: string;
  image_url: string | null;
  contact_info?: string | null;
  share_contact: boolean;
  status: "HILANG" | "DITEMUKAN" | "SELESAI";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string } | null;
};

/** Kolom yang aman dipublikasikan (tanpa contact_info). */
export const PUBLIC_COLUMNS =
  "id,user_id,item_name,category,description,report_type,location,incident_date,image_url,share_contact,status,is_active,created_at,updated_at";
