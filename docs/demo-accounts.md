# Demo Accounts (Production)

Seeded by `ProductionDemoSeeder` (`database/seeders/ProductionDemoSeeder.php`).

**Deploy first, then seed** (the file must be on the server):

```
php artisan db:seed --class=ProductionDemoSeeder --force
```

The seeder is idempotent — safe to re-run, it won't create duplicates.

## Default password (all login accounts)

```
Password123!
```

---

## Where everyone logs in

> Replace `{APP_URL}` with your production domain (e.g. `https://academy.example.com`).

| Group | Login URL | After login |
|-------|-----------|-------------|
| Admins | `{APP_URL}/login` | `/dashboard`, then manage everything under `/admin/...` |
| Ops staff | `{APP_URL}/login` | `/dashboard` |
| Finance staff | `{APP_URL}/login` | `/dashboard` |
| Coaches | `{APP_URL}/login` | redirected to `/coach/dashboard` |
| Parents | `{APP_URL}/parent-access` | magic link emailed to them (no password) |

Parents have **no password**. They log in via a magic link sent to their email, or directly through their unique portal token URL (see [Parents](#parents)).

---

## Admins

| Name | Email | Password |
|------|-------|----------|
| Demo Admin | demo-admin@example.com | `Password123!` |
| Demo Admin 2 | demo-admin2@example.com | `Password123!` |

Login: `{APP_URL}/login`

---

## Ops Staff

| Name | Email | Password |
|------|-------|----------|
| Ops Officer Aiman | ops1@example.com | `Password123!` |
| Ops Officer Mei Ling | ops2@example.com | `Password123!` |
| Ops Officer Raj | ops3@example.com | `Password123!` |

Login: `{APP_URL}/login`

---

## Finance Staff

| Name | Email | Password |
|------|-------|----------|
| Finance Executive Nurul | finance1@example.com | `Password123!` |
| Finance Executive Wei Jie | finance2@example.com | `Password123!` |
| Finance Executive Kavitha | finance3@example.com | `Password123!` |

Login: `{APP_URL}/login`

---

## Coaches

Each coach also has a `CoachProfile` (phone, NRIC, level, hourly rate, bank details, availability).

| Name | Email | Password | Level |
|------|-------|----------|-------|
| Coach Arif Hassan | coach1@example.com | `Password123!` | Master |
| Coach Li Na | coach2@example.com | `Password123!` | Advanced |
| Coach Danial Iskandar | coach3@example.com | `Password123!` | Intermediate |
| Coach Priya Nair | coach4@example.com | `Password123!` | Advanced |
| Coach Yusuf Rahman | coach5@example.com | `Password123!` | Intermediate |
| Coach Siti Mariam | coach6@example.com | `Password123!` | Beginner |

Login: `{APP_URL}/login` → redirected to `/coach/dashboard`

---

## Parents

Parents do **not** have passwords. Access the parent portal by visiting the **direct token URL** below.

> Replace `{APP_URL}` with your production domain (e.g. `https://academy.example.com`).

| Email | Parent portal URL |
|-------|-------------------|
| parent1@example.com | `{APP_URL}/portal/demo-parent-1` |
| parent2@example.com | `{APP_URL}/portal/demo-parent-2` |
| parent3@example.com | `{APP_URL}/portal/demo-parent-3` |
| parent4@example.com | `{APP_URL}/portal/demo-parent-4` |
| parent5@example.com | `{APP_URL}/portal/demo-parent-5` |
| parent6@example.com | `{APP_URL}/portal/demo-parent-6` |
| parent7@example.com | `{APP_URL}/portal/demo-parent-7` |
| parent8@example.com | `{APP_URL}/portal/demo-parent-8` |
| parent9@example.com | `{APP_URL}/portal/demo-parent-9` |
| parent10@example.com | `{APP_URL}/portal/demo-parent-10` |
| parent11@example.com | `{APP_URL}/portal/demo-parent-11` |
| parent12@example.com | `{APP_URL}/portal/demo-parent-12` |
| parent13@example.com | `{APP_URL}/portal/demo-parent-13` |
| parent14@example.com | `{APP_URL}/portal/demo-parent-14` |
| parent15@example.com | `{APP_URL}/portal/demo-parent-15` |

> ℹ️ The `/parent-access` magic-link flow exists for real parents, but seeded `@example.com` emails can't receive mail, so use the token URLs above for testing.

---

## Students

Students do not log in. They are linked to parents and appear in the Admin "Students" screen.

| UID | Name | Parent |
|-----|------|--------|
| STU-1001 | Adam Ahmad Faizal | parent1@example.com |
| STU-1002 | Aisyah Nur Hidayah | parent2@example.com |
| STU-1003 | Bryan Lim | parent3@example.com |
| STU-1004 | Divya Ganesan | parent4@example.com |
| STU-1005 | Aiman Rosnah | parent5@example.com |
| STU-1006 | Justin Chong | parent6@example.com |
| STU-1007 | Jia Yi Tan | parent7@example.com |
| STU-1008 | Hakim Muhammad | parent8@example.com |
| STU-1009 | Amirah Faridah | parent9@example.com |
| STU-1010 | Kavish Kumaravelu | parent10@example.com |
| STU-1011 | Zara Zainal | parent11@example.com |
| STU-1012 | Melissa Lau | parent12@example.com |
| STU-1013 | Danial Harith | parent13@example.com |
| STU-1014 | Santhiya Saraswathy | parent14@example.com |
| STU-1015 | Ethan Ong | parent15@example.com |
| STU-1016 | Haris Ahmad Faizal | parent1@example.com |
| STU-1017 | Nadia Nur Hidayah | parent2@example.com |
| STU-1018 | Wei Han Chong | parent3@example.com |
| STU-1019 | Priyanka Ganesan | parent4@example.com |
| STU-1020 | Liyana Rosnah | parent5@example.com |

---

## Quick reference

- **Staff/Coach password:** `Password123!` (every login account)
- **Staff/Coach login page:** `{APP_URL}/login`
- **Parent portal (no login):** `{APP_URL}/portal/{token}`
- **Parent magic-link page:** `{APP_URL}/parent-access`
