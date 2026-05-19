# Rencana Implementasi: Ekspansi Media Interaktif & Mini-Games Live

Dokumen ini memetakan rencana strategis untuk mengimplementasikan fitur **Interactive Media Share** (YouTube, TikTok, Reels, Tebak Gambar, Voice Notes, AI TTS) di StreamPlay dengan menggunakan **Strategi Hibrida Cerdas** (100% Bebas Biaya Server & API).

---

## 💡 Strategi Hibrida Cerdas (Zero Running Cost)

Untuk menekan biaya operasional VPS platform dan menghindari tagihan API bulanan, kita menerapkan strategi berikut:
1. **Neural Edge-TTS (Gratis & Realistis)**: Menggunakan API Microsoft Edge Neural TTS gratis (tanpa kuota/kunci API) yang menghasilkan suara *neural synthesis* berkualitas tinggi dan natural di dalam OBS Overlay.
2. **Web Audio DSP (Gratis & Ringan)**: Pemrosesan filter suara Voice Note (Robot, Chipmunk, Monster, Telepon, Gema) dilakukan secara langsung di sisi klien menggunakan HTML5 Web Audio API, sehingga server tidak terbebani proses kompresi audio sama sekali.
3. **Premium Upgrade (Creator API Keys)**: Menyediakan kolom input *API Key ElevenLabs* di halaman pengaturan profil kreator. Streamer besar yang menghendaki kloning suara khusus dapat mendanai sendiri kuota ElevenLabs mereka tanpa membebani keuangan platform.

---

## 🛠️ Rencana Perubahan Sistem (Proposed Changes)

### 1. Backend & Database Layer
* **Skema Database Baru** (`donation_media`):
  * `id` (UUID), `donation_id` (Foreign Key), `media_type` (`youtube`, `tiktok`, `reels`, `tebak_gambar`, `voice_note`).
  * `media_url` (varchar/text), `start_time` (int), `duration` (int), `volume_multiplier` (float).
  * `status` (`pending`, `playing`, `completed`, `skipped`, `banned`).
* **Pengaturan Media Kreator** (`creator_media_settings`):
  * **Saklar Utama (Global ON/OFF Toggle)**: Untuk mengaktifkan atau menonaktifkan seluruh fitur media attachment secara total.
  * **Saklar Granular (Per-Media Toggle)**: Switch mandiri untuk menyalakan/mematikan tipe media tertentu secara spesifik (misal: hanya mengaktifkan Donasi Suara/VN, tapi mematikan Pemutar Video YouTube agar tidak mengganggu fokus bermain game).
  * Batasan durasi maksimal video, nominal minimum per-detik video, dan pengaktifan filter konten kasar otomatis.
  * API Key ElevenLabs (opsional, terenkripsi).

---

### 2. Dashboard & Pengaturan Profil Kreator (`/dashboard`)
* **Widget Media Studio**:
  * Panel kontrol media yang sedang diputar di layar stream (tombol *Play*, *Pause*, *Mute*, *Skip*, *Ban Video*).
  * Statistik durasi media yang diputar dan total monetisasi dari media share.
* **Form Profil Kreator**:
  * Saklar ON/OFF global dan granular untuk masing-masing tipe media (YouTube, TikTok, Reels, Tebak Gambar, Voice Note, GIF).
  * Input nominal minimal donasi untuk menyertakan video per-detik (misal: Rp 1.000 / detik video).
  * Saklar pilihan suara pembaca pesan (TTS): default Neural Edge-TTS atau ElevenLabs.

---

### 3. OBS Live Alert Overlay (`/alert-source`)
* **Pemutar Video Universal**:
  * Integrasi iFrame Player YouTube, TikTok, dan Instagram Reels.
  * Efek transisi Soft Neobrutalism yang menutup frame video saat muncul di layar dengan aksen bayangan tebal.
* **Tebak Gambar Canvas Engine**:
  * Merender gambar di HTML5 Canvas dengan filter pikselasi tinggi.
  * Mengurangi level pikselasi (menjadi lebih jelas) secara real-time setiap kali donasi masuk melalui koneksi Socket.io.
  * Mendeteksi tebakan kata kunci di pesan donasi untuk otomatis memicu alert kemenangan.
* **Web Audio DSP Voice Filter**:
  * Menggunakan modul AudioContext untuk memanipulasi klip audio rekaman VN secara instan sebelum diputar ke speaker streamer.

---

## 🌟 User Review & Execution Constraints

> [!WARNING]
> **⚠️ Batasan Eksekusi Agen (Model Execution Constraints):**
> 1. **Dilarang keras melakukan visual testing menggunakan browser subagent (strachplad) / Dilarang buka browser pakai trackpad.** Pengujian manual sepenuhnya diserahkan kepada USER di browser lokalnya.
> 2. **Dilarang men-start atau me-restart backend dan frontend server.**
> 3. **Dilarang melakukan Screenshot.**

---

## 🧪 Rencana Pengujian (Verification Plan)

### Pengujian Otomatis & Simulasi
1. **Simulasi Alert Video**:
   * Meniru kiriman donasi dengan tautan YouTube dari dashboard kontrol -> Pastikan video terputar di Live OBS monitor dengan durasi dan volume yang disesuaikan.
2. **Pengujian Efek Pengubah Suara**:
   * Mengunggah klip rekaman suara uji coba -> Memilih filter "Robot" dan "Monster" -> Memastikan pemutaran suara hasil modulasi terdengar dengan filter yang benar.
3. **Pengujian Pikselasi Tebak Gambar**:
   * Melakukan simulasi donasi bertahap -> Memastikan persentase kejernihan gambar Canvas bertambah secara proporsional sesuai nominal donasi.

---

> [!NOTE]  
> Cetak biru ini akan menjadi acuan pengerjaan kita saat modul ini siap dieksekusi. Rencana ini menjaga StreamPlay tetap efisien, berskala besar, tanpa biaya bulanan API bagi pemilik platform!
