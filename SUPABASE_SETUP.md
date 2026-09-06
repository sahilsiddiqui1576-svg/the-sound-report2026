# The Sound Report: Supabase setup

This version keeps the existing public website and adds a private `/admin` dashboard.

## 1. Create Supabase project

Create a Supabase project on the Free plan.

## 2. Create the database

In Supabase, open **SQL Editor**, create a new query, paste the complete contents of `supabase/schema.sql`, and run it.

## 3. Create the admin login

In Supabase open **Authentication → Users → Add user** and create your own email/password account.

Do not share the password with anyone.

## 4. Add environment variables

In Vercel add these three variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The first two are safe for the website. The service-role key is secret and must never be put in client-side code or committed to GitHub.

## 5. Deploy

Push this project to GitHub and deploy/redeploy it in Vercel.

## 6. First login

Open `/admin`, sign in, and click **Import existing content**. This copies the existing Markdown content into Supabase.

After that, new content can be created and edited entirely from `/admin`.
