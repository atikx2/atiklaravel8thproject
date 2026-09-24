// Admin actions that run without any secret backend key, so the site can be
// hosted anywhere (Netlify, Lovable, etc.). Security is enforced in the database.
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type CreateUserInput = { username: string; phone: string; password: string; makeAdmin?: boolean };

async function assertAdmin() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Unauthorized");
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  if (!isAdmin) throw new Error("Forbidden");
}

export const adminCreateUser = async ({ data }: { data: CreateUserInput }) => {
  await assertAdmin();
  const username = data.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");
  if (username.length < 3) throw new Error("ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে");
  if (data.password.length < 6) throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");

  // Separate client so the admin's own session is not replaced.
  const temp = createClient(
    import.meta.env['VITE_SUPABASE_URL'],
    import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'],
    { auth: { persistSession: false, autoRefreshToken: false, storageKey: "sb-admin-temp" } },
  );
  const { data: created, error } = await temp.auth.signUp({
    email: `${username}@smartjobbd26.app`,
    password: data.password,
    options: { data: { username, phone: data.phone.trim() } },
  });
  if (error || !created.user) throw new Error(error?.message ?? "ইউজার তৈরি করা যায়নি");
  await temp.auth.signOut().catch(() => {});

  if (data.makeAdmin) {
    await supabase.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
  }
  return { id: created.user.id, username };
};

export const adminDeleteUser = async ({ data }: { data: { userId: string } }) => {
  const { error } = await supabase.rpc("admin_delete_user", { _user_id: data.userId });
  if (error) throw new Error(error.message);
  return { ok: true };
};

export const adminResetPassword = async ({ data }: { data: { userId: string; password: string } }) => {
  const { error } = await supabase.rpc("admin_reset_password", {
    _user_id: data.userId,
    _password: data.password,
  });
  if (error) throw new Error(error.message);
  return { ok: true };
};
