# 🚀 Panduan Resmi Deploy & Sinkronisasi Treetmi.id

Dokumen ini berisi panduan standar operasional (SOP) untuk memperbarui aplikasi **Treetmi.id** dari komputer lokal (development) ke server produksi (VPS Live) menggunakan integrasi **GitHub** dan metode **Copy Aman (`cp -r`)**.

---

## 💻 ALUR 1: Di Komputer Lokal (Saat Selesai Coding)

Setiap kali Anda selesai melakukan perubahan kode atau skema database di komputer lokal:

### **Langkah A: Jika Ada Perubahan Database (Prisma)**
Jika Anda mengubah file `prisma/schema.prisma` di lokal, buat file migrasi terlebih dahulu:
```bash
npx prisma migrate dev --name <deskripsi_singkat_perubahan>
```
*Contoh:* `npx prisma migrate dev --name tambah_fitur_laporan`

### **Langkah B: Push Kode ke GitHub**
Jalankan 3 perintah sakti Git ini di terminal folder utama proyek lokal Anda:
```bash
git add .
git commit -m "update: rincian fitur yang Anda tambahkan"
git push origin main
```

---

## 🌐 ALUR 2: Di Terminal Server VPS (Saat Melakukan Update)

Setelah kode terbaru sukses ter-push ke GitHub, masuk ke terminal server VPS Anda dan jalankan perintah di bawah ini secara berurutan:

### **Langkah 1: Ambil Update Terkini dari GitHub**
Masuk ke folder repositori utama Git di server:
```bash
cd /www/wwwroot/treetmi-web-aplication
git pull origin main
```

### **Langkah 2: Salin File yang Ter-update ke Folder Live (Tanpa Menghapus Data)**
Jalankan perintah penyalinan aman berikut untuk menerapkan kode terbaru:

* **Untuk Backend:**
  ```bash
  cp -r /www/wwwroot/treetmi-web-aplication/backend-api/* /www/wwwroot/backend-api/
  ```

* **Untuk Frontend:**
  ```bash
  cp -r /www/wwwroot/treetmi-web-aplication/frontend-app/* /www/wwwroot/frontend-app/
  ```
  > **💡 Info Keamanan:**
  > Metode penyalinan aman `cp -r` ini dijamin **100% aman** karena tidak akan menyentuh atau menghapus file konfigurasi `.env`, database, maupun file upload gambar/avatar dari user Anda di server.

### **Langkah 3: Terapkan Pembaruan di Backend**
Masuk ke folder backend live dan jalankan sinkronisasi database Prisma:
```bash
cd /www/wwwroot/backend-api
npx prisma migrate deploy
npx prisma generate
```
*Setelah selesai, silakan restart proses backend Anda (misalnya melalui PM2 atau panel kontrol aaPanel).*

### **Langkah 4: Terapkan Pembaruan di Frontend**
Masuk ke folder frontend live dan lakukan build ulang aplikasi Next.js:
```bash
cd /www/wwwroot/frontend-app
npm run build
```
*Setelah selesai, silakan restart proses frontend Anda agar perubahan visual/UI langsung aktif dan dapat diakses oleh publik.*

---

## 💡 Tips & Trouble-shooting

1. **Kenapa Perubahan Visual Belum Muncul?**
   Pastikan Anda sudah menjalankan `npm run build` di folder `/www/wwwroot/frontend-app` dan me-restart process manager Next.js di server Anda.
2. **Kapan Harus Menjalankan `npx prisma migrate deploy`?**
   Hanya ketika ada file migrasi baru yang di-pull dari GitHub (ditandai dengan adanya folder baru di dalam `backend-api/prisma/migrations`). Jika tidak ada perubahan skema database, langkah database deploy bisa dilewati.
