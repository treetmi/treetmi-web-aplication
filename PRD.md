# 🚀 STREAMPLAY ID - PRODUCT REQUIREMENT DOCUMENT (PRD)
**Version:** 1.0.0 (MVP Blueprint)  
**Tech Stack:** Node.js (Backend REST API & Socket.io), Next.js (Frontend & OBS Widget), PostgreSQL via Prisma 7 ORM, **Shadcn/ui (Core UI Kit & Tailwind CSS)**.

---

## 1. PROJECT OVERVIEW & VALUE PROPOSITION

### 1.1 Deskripsi Produk
StreamPlay ID adalah platform *all-in-one monetisasi kreator* yang menggabungkan fitur dukungan finansial tradisional (Donasi/Alert seperti Saweria/Sociabuzz) dengan *marketplace* jasa Bermain Bareng (Mabar) secara langsung. Platform ini memfasilitasi penonton (*Viewers*) untuk mendukung sekaligus berinteraksi dalam game dengan Streamer favorit mereka melalui sistem manajemen antrean yang adil dan *real-time*.

### 1.2 Model Bisnis (Keuntungan Platform)
Platform mengimplementasikan **Dynamic Cut-Fee System** otomatis pada setiap transaksi yang berstatus `SUCCESS`:
* **Jalur Donasi Murni:** Potongan komisi platform sebesar **5%** per transaksi.
* **Jalur Jasa Mabar:** Potongan komisi platform sebesar **8%** per transaksi.

---

## 2. CORE FEATURES & USER FLOWS

Platform dibagi menjadi 3 antarmuka utama: **Halaman Publik Kreator**, **Dashboard Privat Streamer**, dan **Widget Overlay OBS**.

### 2.1 Halaman Publik Kreator (`/profile/[username]`)
* **Fitur Tampilan:** Menampilkan avatar, nama streamer, bio, status live (`LIVE` / `OFFLINE`), link sosial media, serta daftar paket game mabar yang aktif beserta harganya.
* **Form Transaksi Donasi:** Kolom input nama pengirim, nominal uang, dan pesan teks.
* **Form Transaksi Mabar:** Pilihan jenis game, kolom input In-Game Name (IGN), In-Game ID, nominal kotor (*gross amount*), dan pesan opsional.
* **Live Queue Widget:** Penonton dapat melihat daftar nomor antrean mabar yang sedang berjalan saat itu juga secara *real-time*.

### 2.2 Dashboard Privat Streamer (`/dashboard`)
* **Autentikasi (Auth):** Login instan dan aman menggunakan akun Google (NextAuth.js).
* **Modul Finansial:** Menampilkan ringkasan total saldo (*Wallet Balance*), riwayat transaksi masuk, formulir pendaftaran rekening bank/e-wallet, dan tombol **"Tarik Dana" (Withdrawal)**.
* **Modul Jasa Game:** Form CRUD untuk mengaktifkan/menonaktifkan game yang disewakan serta mengatur tarif per slot/match.
* **Live Control Dashboard:** Panel kontrol utama saat streaming untuk memantau aliran donasi dan mengendalikan tabel antrean mabar (Tombol *Panggil/Playing*, *Selesai/Done*, dan *Skip*).
* **Setup Integrasi:** Tempat menyalin URL unik widget OBS beserta tombol *Reset Token* jika URL bocor.

### 2.3 Widget Overlay OBS (`/widget/alert/[widget_token]`)
* **Koneksi Real-time:** Membuka pipa komunikasi dua arah (*Persistent Websocket Connection*) ke server backend.
* **Sistem Antrean Suara & Animasi (FIFO Alert Queue):** Mengatur penayangan notifikasi donasi yang masuk bertubi-tubi agar tidak saling bertabrakan (*overlapping*).
* **Text-to-Speech (Bot TTS):** Mengubah teks menjadi audio suara bahasa Indonesia untuk membacakan pesan donasi setelah suara efek (*alert sound*) selesai diputar.

---

## 3. FRONTEND UI & SHADCN SPECIFICATIONS (NEW)

Untuk menjaga konsistensi visual, performa tinggi, dan efisiensi kuota token AI, **seluruh antarmuka frontend WAJIB dibangun menggunakan komponen bawaan Shadcn/ui** yang dikombinasikan dengan Tailwind CSS.

### 3.1 Komponen Shadcn yang Digunakan:
* **`Table` & `Badge`:** Digunakan di Live Control Dashboard untuk menampilkan nomor urut antrean, nama akun game penonton, dan status antrean (`WAITING`, `PLAYING`, `DONE`).
* **`Card`:** Digunakan pada statistik dashboard untuk menampilkan metrik finansial (*Total Saldo*, *Jumlah Transaksi*, *Slot Mabar Terjual*).
* **`Dialog` (Modal):** Digunakan untuk pop-up formulir "Tambah Paket Game Baru", edit rekening bank, dan konfirmasi penarikan saldo (*Withdraw*).
* **`Tabs`:** Digunakan untuk memisahkan menu navigasi internal dashboard (Tab Finansial, Tab Jasa Mabar, Tab Pengaturan Profil, Tab Widget OBS).
* **`Toast` / `Sonner`:** Digunakan untuk memicu notifikasi melayang di dashboard ketika streamer berhasil mengubah status antrean atau sukses menyimpan konfigurasi.

---

## 4. FUNCTIONAL REQUIREMENTS & ARCHITECTURAL DESIGNS

### 4.1 Logika Alur Transaksi & Finansial (Backend Server)
1. Ketika menerima *callback/webhook* sukses dari Payment Gateway, sistem wajib menggunakan **Database ACID Transaction** untuk mengeksekusi operasi berikut secara bersamaan:
   * Mengubah status transaksi dari `PENDING` menjadi `SUCCESS`.
   * Menghitung nilai `platform_fee` (5% atau 8%) dan `net_amount` (`gross_amount` - `platform_fee`).
   * Melakukan *increment* (penambahan) nilai `net_amount` ke kolom `balance` pada tabel user (streamer).
2. Jika tipe transaksi adalah `MABAR`, sistem harus otomatis menyuntikkan data baru ke tabel `mabar_queues` dengan status `WAITING`.
3. Ketika proses database sukses, server wajib memicu fungsi **Socket.io Broadcast** berdasarkan ID Kamar (*Room*) milik `streamer_id` target.

### 4.2 Logika Pipa Pengaman Penarikan Dana (Withdrawal Safety)
* Begitu streamer menekan tombol **"Tarik Dana"**, server secara instan mengunci nominal yang diminta dengan melakukan *decrement* (pengurangan langsung) pada `balance` user di database dan membuat baris baru di tabel `withdrawals` berstatus `PENDING`. 
* Jika status penarikan gagal diproses oleh bank/gateway transfer, saldo baru dikembalikan (*refund*) ke akun streamer.

### 4.3 Logika Pengurut Audio Widget OBS (Frontend Engine)
Widget OBS tidak boleh langsung memutar suara saat data diterima dari websocket. AI wajib menerapkan arsitektur *State Management Queue* berikut:
1. Data dari Socket.io dimasukkan ke dalam antrean lokal (Array).
2. Sistem mengecek status boolean `isPlaying`. Jika `false`, ambil data urutan pertama (*First-In-First-Out*), set `isPlaying = true`.
3. Munculkan komponen animasi visual ke layar, mainkan `.mp3` efek, lalu picu fungsi `window.speechSynthesis` atau Google Translate TTS API untuk membaca teks pesan.
4. Tangkap *event listener* `onended` dari player audio browser. Ketika audio selesai diputar total, beri jeda waktu statis 2 detik, bersihkan layar, ubah `isPlaying = false`, lalu panggil kembali fungsi untuk mengecek sisa data di dalam array antrean.

---

## 5. TECHNICAL DATA SCHEMAPPING (PostgreSQL - Prisma ORM)

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

enum TransactionType {
  DONATION
  MABAR
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
}

enum QueueStatus {
  WAITING
  PLAYING
  DONE
  SKIPPED
}

enum PackageStatus {
  ACTIVE
  INACTIVE
}

enum WithdrawalStatus {
  PENDING
  SUCCESS
  FAILED
}

model User {
  id            String        @id @default(uuid()) @db.Uuid
  username      String        @unique
  email         String        @unique
  balance       Decimal       @default(0.00) @db.Decimal(12, 2)
  widget_token  String        @unique @default(uuid())
  avatar_url    String?       
  youtube_url   String?       
  discord_url   String?       
  is_live       Boolean       @default(false)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  game_packages  GamePackage[]
  transactions   Transaction[] @relation("StreamerTransactions")
  bank_account   BankAccount?
  withdrawals    Withdrawal[]

  @@map("users")
}

model GamePackage {
  id             String        @id @default(uuid()) @db.Uuid
  streamer_id    String        @db.Uuid
  game_name      String
  price_per_slot Decimal       @db.Decimal(10, 2)
  status         PackageStatus @default(ACTIVE)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  streamer       User          @relation(fields: [streamer_id], references: [id], onDelete: Cascade)
  mabar_queues   MabarQueue[]

  @@map("game_packages")
}

model Transaction {
  id            String            @id @default(uuid()) @db.Uuid
  reference_id  String?           @unique 
  streamer_id   String            @db.Uuid
  sender_name   String            @default("Anonymous")
  gross_amount  Decimal           @db.Decimal(12, 2)
  platform_fee  Decimal           @db.Decimal(12, 2)
  net_amount    Decimal           @db.Decimal(12, 2)
  type          TransactionType
  status        TransactionStatus @default(PENDING)
  message       String?           @db.VarChar(500) 
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  streamer      User              @relation("StreamerTransactions", fields: [streamer_id], references: [id], onDelete: Cascade)
  mabar_queue   MabarQueue?

  @@map("transactions")
}

model MabarQueue {
  id               String      @id @default(uuid()) @db.Uuid
  transaction_id   String      @unique @db.Uuid
  package_id       String      @db.Uuid
  ingame_nickname  String
  ingame_id        String
  status           QueueStatus @default(WAITING)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  transaction      Transaction @relation(fields: [transaction_id], references: [id], onDelete: Cascade)
  game_package     GamePackage @relation(fields: [package_id], references: [id], onDelete: Restrict)

  @@map("mabar_queues")
}

model BankAccount {
  id                  String   @id @default(uuid()) @db.Uuid
  streamer_id         String   @unique @db.Uuid
  bank_name           String   
  account_number      String
  account_holder_name String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  streamer            User     @relation(fields: [streamer_id], references: [id], onDelete: Cascade)

  @@map("bank_accounts")
}

model Withdrawal {
  id               String           @id @default(uuid()) @db.Uuid
  streamer_id      String           @db.Uuid
  amount_requested Decimal          @db.Decimal(12, 2)
  disbursement_fee Decimal          @default(5000.00) @db.Decimal(10, 2) 
  status           WithdrawalStatus @default(PENDING)
  reference_id     String?          @unique 
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  streamer         User             @relation(fields: [streamer_id], references: [id], onDelete: Cascade)

  @@map("withdrawals")
}

{
  "id": "468a3502-0cad-4dd8-bd41-d8f0ceb77e51",
  "username": "admin",
  "email": "admin@treetmi.id",
  "balance": "1500000",
  "widget_token": "088736c0-3260-42dd-9a53-b152317d23ea",
  "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  "youtube_url": "https://youtube.com",
  "discord_url": "https://discord.com",
  "is_live": true,
  "createdAt": "2026-05-17T17:21:46.771Z",
  "updatedAt": "2026-05-17T17:21:46.771Z"
}