import { getSession } from "@/lib/auth";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const user = await getSession();
  return <NavbarClient user={user ? { name: user.full_name, role: user.role } : null} />;
}
