# PANDUAN LEGALITAS & KLASIFIKASI SISTEM INTERNAL
**Entitas:** PT Rezeki Karya Mandiri
**Proyek:** Ekosistem treetmi.id & Sistem Internal payhook
**Model Bisnis:** Jual Beli Produk Digital & Kemitraan Jasa (B2B / Freelance)

---

## 1. Definisi & Status Hukum Aplikasi

Dua sistem yang beroperasi harus dipisahkan fungsinya secara jelas, baik secara teknis maupun dalam penyebutan publik/legal.

### A. TREETMI.ID (Platform Publik)
*   **Status Publik:** Platform Digital / Portal Web Hiburan.
*   **Fungsi Utama:** Katalog produk digital, tempat interaksi kreator (streamer) dan pengguna (penonton).
*   **Aktivitas Penonton:** Melakukan **"Pembelian Produk Digital"** berupa *Virtual Points* (Koin/Poin). **TIDAK ADA** istilah "Menabung", "Deposit", atau "Top-Up Saldo E-Wallet".
*   **Aktivitas Streamer:** Bekerja sebagai **"Mitra Independen / Penyedia Jasa Konten"**. Mereka mengumpulkan *Virtual Points* sebagai indikator performa kerja yang akan ditagihkan (*invoice*) ke perusahaan.

### B. PAYHOOK (Sistem Internal / Backend)
*   **Status Hukum / Internal:** Sistem Biling Internal (Internal Billing System) & Otomasi Pencatatan.
*   **Fungsi Utama:** Membaca notifikasi mutasi bank (Webhook) dan memperbarui *database* secara otomatis.
*   **Status Terlarang:** **DILARANG KERAS** diklasifikasikan, disebut, atau dipasarkan sebagai *Payment Gateway*, *E-Wallet*, atau *Penyelenggara Transfer Dana* di ranah publik maupun dokumen legal.

---

## 2. Skema Alur Dana (Fund Flow) & Pencatatan Akuntansi

Agar terhindar dari regulasi *Payment Gateway* Bank Indonesia (BI), alur dana diakui sebagai transaksi jual-beli barang/jasa standar perusahaan.

### A. Alur Uang Masuk (Inbound)
1. Penonton membeli paket *Virtual Points* di `treetmi.id`.
2. Penonton mentransfer uang riil ke rekening PT Rezeki Karya Mandiri.
3. `payhook` mendeteksi uang masuk dan menambahkan *Virtual Points* ke akun penonton.
4. **Pencatatan Akuntansi PT:** Uang yang masuk dicatat sebagai **"Pendapatan/Omset Penjualan Produk Digital"**.

### B. Alur Uang Keluar / Payout (Outbound)
1. Streamer menukarkan *Virtual Points* mereka di `treetmi.id` dan mengajukan *payout* (estimasi 1-2 hari kerja manual).
2. Sistem secara otomatis membuat (meng-*generate*) **Faktur/Invoice Digital** yang menyatakan bahwa Streamer menagih biaya jasa pembuatan konten ke platform.
3. PT Rezeki Karya Mandiri mentransfer uang riil (via bank, Wise, Topremit, dll) ke rekening/e-wallet Streamer.
4. **Pencatatan Akuntansi PT:** Uang yang keluar dicatat sebagai **"Beban Pembayaran Jasa Pihak Ketiga / Biaya Operasional Konten"**.

---

## 3. Terminologi / Pemilihan Kata (Do's & Don'ts)

Kesalahan penggunaan istilah di antarmuka (UI) web atau di *Terms & Conditions* dapat memicu audit dari otoritas keuangan.

| HINDARI KATA INI (Risiko Audit BI) | GUNAKAN KATA INI (Aman B2B/Digital) |
| :--- | :--- |
| Top-Up Saldo | Beli Poin / Beli Koin |
| Dompet Digital / Saldo Uang | Saldo Poin Virtual |
| Tarik Tunai / Cash-out | Tukar Poin / Klaim Reward / Tagih Komisi |
| Deposit | Pembelian Awal |
| Payment Gateway (untuk payhook) | Sistem Biling / Konfirmasi Otomatis |

---

## 4. Checklist Kepatuhan Administrasi (Legalitas)

Untuk menjalankan skema ini secara legal, PT Rezeki Karya Mandiri wajib memiliki:
- [ ] **NIB Aktif** dengan KBLI yang relevan (contoh: 63122 - Portal Web dan/atau Platform Digital Tanpa Tujuan Komersial / Komersial).
- [ ] **Tanda Daftar PSE (Penyelenggara Sistem Elektronik) Kominfo** Lingkup Privat untuk domain `treetmi.id`.
- [ ] Halaman **Terms & Conditions (T&C)** di web yang secara tegas menyatakan bahwa *Virtual Points* tidak bernilai uang tunai di luar platform dan hanya berlaku sebagai alat ukur aktivitas di dalam `treetmi.id`.
- [ ] Sistem penerbitan **Invoice Internal** PDF/Digital setiap kali streamer berhasil melakukan penarikan komisi (sebagai bukti arsip keuangan PT).

---
*Dokumen ini bersifat rahasia dan menjadi pedoman arsitektur bisnis dan hukum untuk tim internal.*