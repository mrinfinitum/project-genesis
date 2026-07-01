"use client";

import { useEffect, useState } from "react";
import { Shield, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type ManagedUser = {
  id: string;
  email: string;
  role: "admin" | "member";
  created_at: string;
  last_sign_in_at: string | null;
};

type UsersResponse = {
  current_user_id: string;
  users: ManagedUser[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function UserManagementPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshUsers() {
    setError("");
    const response = await fetch("/api/admin/users");
    const payload = (await response.json()) as Partial<UsersResponse> & { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Could not load users.");
      return;
    }

    setUsers(payload.users ?? []);
    setCurrentUserId(payload.current_user_id ?? "");
  }

  useEffect(() => {
    refreshUsers();
  }, []);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        role
      })
    });
    const payload = (await response.json()) as { emailed?: boolean; error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Could not create user.");
      setLoading(false);
      return;
    }

    setEmail("");
    setPassword("");
    setRole("member");
    setMessage(payload.emailed ? "Studio invite email sent." : "Studio user created.");
    await refreshUsers();
    setLoading(false);
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Delete ${user.email}? This removes their studio login.`)) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
      method: "DELETE"
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Could not delete user.");
      setLoading(false);
      return;
    }

    setMessage("Studio user deleted.");
    await refreshUsers();
    setLoading(false);
  }

  return (
    <section className="rounded-md border border-cyan-300/15 bg-[#07101e]/85 p-5 shadow-glow">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">User Access</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Studio Users</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Invite admin or member accounts, create temporary-password logins, and remove users who should no longer access the studio.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-cyan-300/15 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
          <Shield className="h-4 w-4" />
          Admin only
        </div>
      </div>

      <form className="mb-5 grid gap-3 rounded-md border border-cyan-300/10 bg-slate-950/45 p-4 lg:grid-cols-[1fr_1fr_10rem_auto]" onSubmit={createUser}>
        <label className="block text-sm text-slate-200">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</span>
          <input
            className="h-10 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-white outline-none transition focus:border-cyan-300/60"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block text-sm text-slate-200">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Temporary Password</span>
          <input
            className="h-10 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-white outline-none transition focus:border-cyan-300/60"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Leave blank to email invite"
          />
        </label>
        <label className="block text-sm text-slate-200">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Role</span>
          <select
            className="h-10 w-full rounded-md border border-cyan-300/20 bg-slate-950/60 px-3 text-white outline-none transition focus:border-cyan-300/60"
            value={role}
            onChange={(event) => setRole(event.target.value === "admin" ? "admin" : "member")}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button className="h-10 w-full" disabled={loading} type="submit">
            <UserPlus className="h-4 w-4" />
            {password ? "Create" : "Invite"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-cyan-300/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Last Sign In</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-300/10">
            {users.length ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-slate-100">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(user.last_sign_in_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      className="h-8 border-red-400/25 bg-red-400/10 px-2 text-red-100 hover:border-red-300/60 hover:bg-red-400/20"
                      disabled={loading || user.id === currentUserId}
                      onClick={() => deleteUser(user)}
                      type="button"
                      title={user.id === currentUserId ? "You cannot delete your own active account" : "Delete user"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-center text-slate-400" colSpan={5}>
                  <Users className="mx-auto mb-2 h-5 w-5 text-slate-500" />
                  No studio users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {message ? <p className="mt-4 rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-100">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
    </section>
  );
}
