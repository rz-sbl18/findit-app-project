import { notFound, redirect } from "next/navigation";
import { getSession } from "./auth";

export async function requireUserPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

/** Pemeriksaan role otoritatif (dibaca dari database) untuk halaman admin. */
export async function requireAdminPage() {
  const user = await requireUserPage();
  if (user.role !== "ADMIN") notFound();
  return user;
}
