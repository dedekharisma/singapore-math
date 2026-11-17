# Singapore Math Learning Hub

Aplikasi belajar Singapore Math satu halaman (`index.html`, React + CSS inline, tanpa build step).

## Menjalankan
Buka `index.html` di browser, atau aktifkan GitHub Pages (Settings → Pages → Deploy from branch `main` / root).

## Penyimpanan progress
- Progress dan catatan disimpan di `localStorage` browser (per perangkat).
- Jika dibuka di claude.ai sebagai artifact, data juga disinkronkan ke database akun pengguna.
- Di luar claude.ai (mis. GitHub Pages) hanya `localStorage` yang aktif; gunakan fitur backup JSON untuk pindah perangkat.
