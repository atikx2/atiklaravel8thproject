import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CreateUserInput = { username: string; phone: string; password: string; makeAdmin?: boolean };

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateUserInput) => input)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const username = data.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");
    if (username.length < 3) throw new Error("ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে");
    if (data.password.length < 6) throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: `${username}@smartjobbd26.app`,
      password: data.password,
      email_confirm: true,
      user_metadata: { username, phone: data.phone.trim() },
    });
    if (error || !created.user) throw new Error(error?.message ?? "ইউজার তৈরি করা যায়নি");

    if (data.makeAdmin) {
      await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    }
    return { id: created.user.id, username };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.userId === context.userId) throw new Error("নিজের একাউন্ট মুছা যাবে না");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.password.length < 6) throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });