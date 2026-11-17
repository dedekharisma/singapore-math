# Singapore Math Learning Hub

Aplikasi statis (`index.html`, tanpa build step). Progress disimpan di `localStorage` dan, setelah login, disinkronkan ke Supabase.

## Setup Supabase
1. Buat project di https://supabase.com.
2. SQL Editor → jalankan isi `supabase/schema.sql` (tabel `progress` + Row Level Security).
3. Authentication → Providers: pastikan **Email** aktif (magic link).
4. Authentication → URL Configuration: isi **Site URL** dengan URL Vercel Anda, dan tambahkan URL tersebut ke **Redirect URLs** (juga `http://localhost:3000` untuk uji lokal).
5. Project Settings → API: salin **Project URL** dan **anon key** ke `config.js`.

## Deploy ke Vercel
1. vercel.com → Add New → Project → impor repo ini.
2. Framework Preset: **Other**; Build Command dan Output Directory dibiarkan kosong (root statis).
3. Deploy. Setiap push ke `main` akan otomatis ter-deploy.

## Cara kerja sinkronisasi
- Tanpa login: hanya `localStorage` (per perangkat).
- Setelah login (link masuk lewat email): dokumen `state`, `notes`, `journal` di-upsert ke tabel `progress`; versi dengan `updatedAt` terbaru menang.
- Adapter ada di `supabase-shim.js`; aplikasi utama tidak diubah.
- Backup/restore JSON di aplikasi tetap berfungsi.
