import { randomUUID } from "crypto";
import { db, BUCKET } from "./supabase";
import { MAX_IMAGE_BYTES } from "./constants";

const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const EXT_OK = new Set(["jpg", "jpeg", "png", "webp"]);

function detectType(b: Uint8Array): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP")
    return "image/webp";
  return null;
}

export class UploadError extends Error {}

/** Validasi ukuran, MIME, ekstensi, dan magic bytes; simpan dengan nama acak. Mengembalikan URL publik. */
export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new UploadError("File kosong");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Ukuran foto maksimal 2 MB");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!EXT_OK.has(ext)) throw new UploadError("Ekstensi file harus jpg, jpeg, png, atau webp");
  if (!ALLOWED[file.type]) throw new UploadError("Tipe file harus JPEG, PNG, atau WebP");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const real = detectType(bytes);
  if (!real || real !== file.type) throw new UploadError("Isi file bukan gambar yang valid");

  const path = `${randomUUID()}.${ALLOWED[real]}`; // nama asli pengguna tidak dipakai
  const { error } = await db().storage.from(BUCKET).upload(path, bytes, { contentType: real, upsert: false });
  if (error) throw new UploadError("Gagal menyimpan foto");
  return db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function removeImage(url: string | null | undefined) {
  if (!url) return;
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = url.slice(i + marker.length);
  if (/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path)) await db().storage.from(BUCKET).remove([path]);
}
