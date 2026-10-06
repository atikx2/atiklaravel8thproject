# SmartJobBD26 — Project Summary (for AI agents)

This document is a complete context brief so any AI agent (or developer) can understand
and safely modify this project **without asking the owner anything**. Read it fully before
making changes.

## 1. What this site is

**SmartJobBD26** (smartjobbd26) is a Bengali-language **micro-job / earning platform** for
Bangladesh. The owner posts jobs/ads; users complete small tasks (watch ads, watch videos,
micro tasks) and earn Taka (৳). Users sign up with **username + phone number + password**
(no email — emails are synthesized, see §4). Payments use **bKash** and **Nagad** only.

- Lovable-hosted live app: `https://smartjobbd26.lovable.app`
- Also deployed by the owner on **Netlify** (see §8).
- Full site UI copy is in **Bengali (বাংলা)**. Keep it that way.

## 2. Tech stack

- **TanStack Start v1** (React 19, TanStack Router file-based routing, Vite 8, Tailwind CSS v4).
- Backend: **Supabase** (Postgres + Auth + RLS). Lovable Cloud manages it.
- Client-side Supabase calls everywhere (`@/integrations/supabase/client`); security is
  enforced **in the database** (RLS + SECURITY DEFINER functions), not in secret server keys.
  This is intentional so the site can also run as a static-ish deploy on Netlify.
- State: TanStack Query. Auth state: custom `AuthProvider` in `src/lib/auth.tsx`.
- Design: **dark premium (app-like) look** — near-black plum background with the brand
  gradient **#FF3D77 → #FF7A00** (`--brand-1` / `--brand-2`, exposed as `--gradient-brand`,
  utilities `bg-brand`, `text-gradient`, `glow`, `surface-card`, `tile`). Bengali digits
  everywhere. The site is dark-only: `:root` already holds the dark values.

## 3. Route map

| Path | File | Purpose |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Public landing page (hero, trust counters, testimonials, FAQ, marquee bonus banner) |
| `/auth` | `src/routes/auth.tsx` | User login / register (username, phone, password) |
| `/admin-login` | `src/routes/admin-login.tsx` | Separate admin login (admin panel is NOT reachable from user auth) |
| `/_authenticated/dashboard` | dashboard.tsx | User dashboard: banner (admin-set URL), balance, partner cards, quick links |
| `/_authenticated/jobs` | jobs.tsx | Daily package ads ("দেখুন" → 5s countdown → auto credit) + micro tasks |
| `/_authenticated/packages` | packages.tsx | Package list + purchase checkout + "আপনার প্যাকেজ ইতিহাস" |
| `/_authenticated/deposit` | deposit.tsx | Deposit request (bKash/Nagad, sender number, optional `?pkg=` checkout) |
| `/_authenticated/withdraw` | withdraw.tsx | Withdraw request (min ৳৫০০) |
| `/_authenticated/history` | history.tsx | Transactions / job results (success vs failed) |
| `/_authenticated/profile` | profile.tsx | Account card, balance/earnings, all menu links, logout |
| `/about` | `src/routes/about.tsx` | Public "সম্পর্কে ও সাপোর্ট" page (how it works, rules, payment, FAQ) |
| `/_admin/*` | `src/routes/_admin/*` | Full admin panel (sidebar on desktop, drawer on mobile) |

`/_authenticated/route.tsx` gates on `supabase.auth.getUser()` and redirects to `/auth`.
`/_admin/route.tsx` additionally gates on the `admin` role (client check + RLS server-side).

## 4. Auth model (important, non-obvious)

- Users **never enter an email**. Username is normalized to
  `<username>@smartjobbd26.app` (`emailForUsername` in `src/lib/auth.tsx`) and that is the
  Supabase auth email. Username, phone stored in user metadata + `profiles`.
- `AuthProvider` is mounted in `src/routes/__root.tsx` wrapping the `<Outlet />`.
  **Do not remove it** — everything (balance, gating, package history, ads) breaks without it.
- Roles live in the `user_roles` table (enum `app_role`: `admin`, `user`), checked via the
  `has_role(uuid, app_role)` SECURITY DEFINER function. Never store roles on `profiles`.

## 5. Database (public schema)

Tables: `profiles`, `user_roles`, `jobs`, `job_submissions`, `deposits`, `withdrawals`,
`transactions`, `packages`, `package_purchases`, `package_ad_views`, `payment_numbers`,
`app_settings`.

- `profiles` — `balance`, `total_earned`, `has_deposited` (first-deposit gate), `is_blocked`,
  `username`, `phone`. Signup trigger grants a **৳২০০ welcome bonus** (transaction row +
  balance).
- `app_settings` (row `id='main'`) — `bkash_number`, `nagad_number`, `min_withdraw` (৳500),
  `min_deposit`, `banner_image_url`. Admin edits via panel.
- `payment_numbers` — multiple bKash/Nagad numbers with labels, `is_active`.
- `packages` — `name, price, daily_ads, daily_income, validity_days, ad_link, is_active,
  sort_order`. Owner's 11 packages: ৳৫০০→3 ads/৳৩০০ daily, ৳১,০০০→6/৳৬০০, ৳১,৫০০→9/৳৯০০,
  … up to package ১১; all 28/60-day terms. `ad_link` may be **empty** — that is safe
  (timer still runs and pays).
- `deposits` — status `pending/approved/rejected`; may carry `package_id` (package checkout).
- `package_purchases` — created only when a **package deposit is approved**.
- `package_ad_views` — one view per (`purchase_id`, `ad_index`, Asia/Dhaka date); UNIQUE
  constraint; view date computed as UTC+6.

RPCs (all SECURITY DEFINER, admin-checked where noted):
- `has_role(_user_id, _role)` — role check usable in RLS.
- `complete_package_ad(_purchase_id, _ad_index)` — validates purchase owner/expiry/index/
  not-viewed-today, then credits `daily_income / daily_ads` to balance + `total_earned`
  and logs an `earning` transaction.
- `admin_delete_user(_user_id)`, `admin_reset_password(_user_id, _password)` — admin only.

Triggers / business rules (do not remove):
- **One active purchase per package**: a user cannot re-buy a package while a purchase is
  active or a deposit for it is pending (DB trigger on `deposits` rejects the insert).
- **Package price ≠ balance**: when a package deposit is approved, only the purchase is
  created — the **package price is NOT added to the user's balance** (fixed deliberately).
  Only regular (non-package) deposits credit the balance, plus ad earnings.
- **First-deposit gate**: a user cannot work jobs/ads until `profiles.has_deposited` is true
  (the ৳200 bonus does not unlock work).
- GRANTs on every public table to `authenticated` / `anon` / `service_role` exist — keep them
  when altering tables.

## 6. Admin panel (`/admin-login` → `/admin`)

Separate login from users. Owner account: `atik` (password `Atik123@@` — test account,
owner may rotate). Capabilities: dashboard stats, create/delete users, reset passwords,
block users, add/remove admins, job CRUD + task verification, deposit approval (creates
package purchases when applicable), withdrawal approval, package CRUD (including setting
each package's **default ad link**), payment numbers & limits editing, dashboard banner URL.

## 7. Conventions an agent must follow

- All UI text in Bengali; digits via `bn(n)` and money via `taka(n)` from `src/lib/auth.tsx`.
- `src/components/LiveWithdraw.tsx` is **demo social-proof data** (seeded PRNG for the first
  render so SSR hydration matches, then random rows on a timer). Never wire real withdrawal
  rows into it.
- `src/components/EarningsChart.tsx` is a dependency-free SVG area chart built from the
  user's `transactions` rows (`earning` + `bonus`, cumulative) — no recharts, no SSR risk.
- Mobile nav = 4 bottom tabs (হোম / টাস্ক / প্যাকেজ / প্রোফাইল) in `AppHeader.tsx`; everything
  else is reachable from the dashboard tile grid and the profile page.
- Design tokens from `src/styles.css` (semantic classes like `surface-card`, `bg-brand`,
  `text-primary`) — never hardcode colors; keep the white indigo/violet SaaS style.
- Mobile-first: sticky bottom icon nav on phones; desktop responsive with sidebar.
- External links entered by admin (e.g. `fiverr.com`) go through `normalizeLink()` from
  `src/lib/packages.ts` before opening.
- Payments logos/images live in `public/images/` (bundled) so Netlify renders them; see
  `src/lib/pay-logos.ts`.
- After changes run `bunx tsgo --noEmit`.
- Keep everything working with **empty ad links**, no admin activity, and no credits —
  the site must never crash from missing data.

## 8. Deployment

- Lovable hosts a preview/published copy (syncs automatically with code changes).
- The owner also publishes to **Netlify**: `netlify.toml` + `NETLIFY=true` env switches the
  Nitro preset to `netlify`. Required env var **names** (values are secrets, never write
  them into docs): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`. Netlify sync is manual — the owner does it from GitHub.
- Do not attempt GitHub Pages / static-only export: SSR + admin flows need the server runtime.
