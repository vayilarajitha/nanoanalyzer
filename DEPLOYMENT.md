# NanoAnalyzer - Cloud-Native Supabase & PHP Deployment Guide

This guide provides step-by-step instructions for deploying the **NanoAnalyzer** platform to any modern cloud PHP hosting service using **Supabase PostgreSQL** and **Supabase Storage**.

---

## 1. Supabase Cloud Setup

### A. Create a Supabase Project
1. Navigate to [https://supabase.com](https://supabase.com) and log in or create an account.
2. Click **New Project** and configure your project settings:
   - **Project Name**: `nanoanalyzer-cloud`
   - **Database Password**: Create a strong password (keep this secure).
   - **Region**: Choose the region closest to your server or target users.
3. Once the project is provisioned, navigate to **Project Settings -> Database** to find your connection credentials:
   - **Host**: `db.YOUR_PROJECT_REF.supabase.co` or pooler host (e.g. `aws-0-region.pooler.supabase.com`)
   - **Port**: `5432` or `6543`
   - **User**: `postgres.YOUR_PROJECT_REF` or `postgres`
   - **Database Name**: `postgres`
   - **Password**: Your database password created above.

### B. Execute Database Schema
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Click **New Query**.
3. Open [database/schema.sql](database/schema.sql) from the repository, copy its entire contents, and paste it into the Supabase SQL Editor.
4. Click **Run**.
5. Verify that all 9 tables (`users`, `nanoparticle_datasets`, `analysis_results`, `experiments`, `history`, `notifications`, `otp_codes`, `chatbot_logs`, `system_logs`), views (`datasets`, `predictions`), RLS policies, and seed data are created cleanly.

### C. Create Supabase Storage Buckets
1. In the Supabase Dashboard, navigate to **Storage**.
2. Create two **Public** buckets:
   - `avatars` (Public bucket for researcher avatars)
   - `datasets` (Public bucket for dataset CSV files)
3. Ensure public read access policies are enabled for both buckets.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` in the root of your application and fill in your Supabase project credentials:

```ini
# Supabase API Credentials
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Supabase PostgreSQL Connection Credentials
SUPABASE_DB_HOST=aws-0-region.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.YOUR_PROJECT_REF
SUPABASE_DB_PASSWORD=YOUR_SUPABASE_DB_PASSWORD

# Application Settings
APP_ENV=production
SECRET_KEY=nanouptake_analyzer_secure_token_secret_2026
```

---

## 3. Hosting Deployment (Vercel, Render, Railway, Shared Hosting / cPanel)

### Prerequisites for PHP Server:
- **PHP Version**: 8.0 or higher.
- **PHP Extensions**: `pdo_pgsql`, `curl`, `json`, `mbstring`, `openssl`.

### Option A: Railway / Render (Cloud Container Hosting)
1. Push your repository to GitHub / GitLab.
2. Connect your repository to **Railway** or **Render**.
3. Choose PHP runtime (e.g. PHP 8.2 with Apache/Nginx).
4. Add the environment variables from your `.env` file under project settings.
5. Deploy.

### Option B: Standard PHP / cPanel / VPS Hosting
1. Upload all project files to your web server root (e.g. `public_html` or www folder).
2. Ensure `.env` is uploaded (or set environment variables in your server configuration / `.htaccess`).
3. Ensure PHP `pdo_pgsql` extension is enabled in `php.ini`.

---

## 4. Verification & Initial Login

Once deployed, visit your domain:
- **Login Page**: `https://your-domain.com/login.php`
- **Default Admin Account**:
  - **Email**: `admin@nanoanalyzer.io`
  - **Password**: `admin123`
- **Default Researcher Account**:
  - **Email**: `alex@nanoanalyzer.io`
  - **Password**: `researcher123`

---

## 5. Security Best Practices

1. Never commit `.env` containing production passwords to public version control.
2. Keep `SUPABASE_SERVICE_ROLE_KEY` secret.
3. Change default passwords for `admin@nanoanalyzer.io` and `alex@nanoanalyzer.io` upon initial setup in production environments.
