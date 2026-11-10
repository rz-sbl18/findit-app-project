import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const { data } = await db().from("profiles").select("id,full_name,email,role,created_at").order("created_at", { ascending: false }).limit(500);
  const users = (data ?? []) as Array<{ id: string; full_name: string; email: string; role: string; created_at: string }>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-800">Pengguna ({users.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Terdaftar</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.full_name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.role}</td>
                <td className="p-3">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
