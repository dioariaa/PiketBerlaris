# PRD: Berlaris Piket — Sistem Jadwal & Checklist Kebersihan Digital

**Versi:** 2.0
**Tanggal:** 6 Juli 2026
**Author:** Dio (Asst. Manager, Berlaris Kopi & Resto)
**Status:** Final Draft

---

## 1. Problem Statement

Berlaris Kopi & Resto mengelola jadwal piket kebersihan harian menggunakan formulir kertas mingguan. 4 staff (Yusuf, Caca, Mitha, Tegar) bertanggung jawab atas 17 tugas kebersihan di Lantai 1, Lantai 2, dan area Office.

**Masalah utama:**

- **Tidak ada bukti digital** — paraf di kertas mudah dipalsukan, tidak ada timestamp.
- **Tidak ada foto dokumentasi** — SOP mengharuskan foto before/after ke grup WhatsApp, tapi compliance tidak termonitor.
- **Tidak ada visibility untuk management** — Dio harus cek fisik kertas, data historis tidak terekam.
- **Konteks transisi organisasi** — pasca audit keuangan yang menemukan irregularitas, accountability dan transparansi operasional jadi prioritas tinggi.

**Dampak jika tidak diselesaikan:** Standar kebersihan inkonsisten, tidak ada data evaluasi staff, management blind terhadap operasional harian.

---

## 2. Goals

| # | Goal | Metrik Sukses |
|---|------|--------------|
| G1 | Menghilangkan formulir kertas piket | 100% pencatatan via app dalam 2 minggu |
| G2 | Visibility real-time ke management | Dio bisa cek progress dari HP kapanpun |
| G3 | Meningkatkan accountability staff | Setiap tugas punya timestamp + identitas + foto bukti |
| G4 | Mendokumentasikan kondisi area | Foto before/after tersimpan digital per tugas per hari |
| G5 | Data historis untuk evaluasi | Dashboard completion rate per staff dan per area |

---

## 3. Non-Goals

| # | Non-Goal | Alasan |
|---|----------|--------|
| NG1 | Integrasi dengan Berlaris App (inventory) | Standalone; Berlaris App masih aktif dikembangkan |
| NG2 | Settlement kasir / fitur keuangan apapun | Completely out of scope — beda domain |
| NG3 | Notifikasi push / reminder otomatis | Butuh service worker; belum prioritas |
| NG4 | Multi-outlet support | Satu outlet saja |
| NG5 | Fitur absensi / clock-in | Scope terpisah |
| NG6 | Approval workflow | Overkill untuk tim 4 orang |
| NG7 | Offline-first / PWA | Resto punya WiFi; kalau mati catat manual dulu |

---

## 4. Architecture & Roles

### Dua Interface, Satu Database

```
┌─────────────────────┐     ┌─────────────────────────┐
│   PUBLIC PAGE (/)    │     │   ADMIN PAGE (/admin)   │
│                      │     │                         │
│  • Lihat tugas hari  │     │  • Login (email + pass) │
│    ini               │     │  • Kelola jadwal mingguan│
│  • Centang selesai   │     │  • Dashboard rekap harian│
│  • Upload foto B/A   │     │  • Gallery foto staff   │
│  • Tambah catatan    │     │  • Manage staff list    │
│  • Lihat jadwal      │     │  • Manage task list     │
│    minggu ini        │     │                         │
│                      │     │  Protected by           │
│  NO AUTH REQUIRED    │     │  Supabase Auth          │
└────────┬────────────┘     └────────┬────────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
         ┌───────────────────────┐
         │      SUPABASE         │
         │                       │
         │  • Postgres DB        │
         │  • Auth (admin only)  │
         │  • Storage (foto)     │
         │  • Row Level Security │
         └───────────────────────┘
```

### Tech Stack

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Frontend | React + Vite + Tailwind CSS | Familiar, fast, mobile-first |
| Backend/DB | Supabase (Postgres + Auth + Storage) | All-in-one, free tier cukup, RLS built-in |
| Hosting | Vercel | Free tier, auto-deploy dari GitHub |
| File Storage | Supabase Storage | Foto before/after, compressed client-side sebelum upload |

---

## 5. Users & Personas

### Staff Operasional — PUBLIC (Yusuf, Caca, Mitha, Tegar)
- **Device:** HP Android budget-mid, Chrome mobile
- **Tech literacy:** Rendah-menengah
- **Flow:** Buka link → pilih nama → lihat tugas hari ini → centang + foto → done
- **Critical constraint:** Kalau lebih dari 3 tap untuk selesaikan 1 tugas, mereka balik ke kertas

### Asst. Manager (Dio) — ADMIN
- **Device:** HP Android + kadang laptop
- **Tech literacy:** Tinggi
- **Flow:** Login → atur jadwal minggu ini → monitor progress harian → review foto → evaluasi

---

## 6. User Stories

### Public (Staff)

- **US-01:** Sebagai staff, saya pilih nama saya saat buka app, supaya langsung lihat tugas saya hari ini.
- **US-02:** Sebagai staff, saya tap tugas untuk centang selesai, dan sistem otomatis catat waktu.
- **US-03:** Sebagai staff, saya bisa upload foto before/after dari kamera HP langsung.
- **US-04:** Sebagai staff, saya bisa tambah catatan jika ada kondisi khusus (keran bocor, lampu mati).
- **US-05:** Sebagai staff, saya bisa lihat jadwal piket seluruh minggu untuk semua staff.
- **US-06:** Sebagai staff, saya bisa lihat progress tugas hari ini (berapa yang sudah/belum).

### Admin (Dio)

- **US-07:** Sebagai admin, saya login dengan email + password.
- **US-08:** Sebagai admin, saya mengatur jadwal piket mingguan — assign staff ke tugas per hari.
- **US-09:** Sebagai admin, saya bisa duplikasi jadwal minggu lalu ke minggu ini.
- **US-10:** Sebagai admin, saya lihat dashboard rekap harian — completion rate, siapa yang sudah/belum.
- **US-11:** Sebagai admin, saya lihat rekap per staff per minggu (assigned vs completed).
- **US-12:** Sebagai admin, saya browse foto yang diupload staff, filter per hari dan per area.
- **US-13:** Sebagai admin, saya bisa tambah/edit/hapus daftar tugas dan daftar staff.
- **US-14:** Sebagai admin, saya bisa edit catatan SOP yang tampil di halaman public.

---

## 7. Requirements

### P0 — Must Have (Sprint 1: Minggu 1)

| ID | Requirement | Acceptance Criteria |
|----|------------|-------------------|
| R01 | **Public: Pilih staff** | Halaman utama menampilkan 4 tombol nama staff. Setelah pilih, tampil tugas hari ini untuk staff tersebut. Pilihan tersimpan di localStorage. Ada tombol "Lihat Semua" untuk lihat semua tugas. |
| R02 | **Public: Checklist harian** | List tugas hari ini grouped by area (LT1, LT2, Office, All). Tap untuk centang. Timestamp otomatis tersimpan ke Supabase. Progress bar di atas. Bisa unchecked (toggle). |
| R03 | **Public: Upload foto before/after** | Dua panel terpisah di bawah checklist: panel "Before" dan panel "After". Tidak terikat ke task tertentu — terikat ke staff + tanggal. Staff bisa upload multiple foto per panel (bebas jumlahnya). Accept image dari kamera atau gallery. Client-side compress ke max 800px & 80% quality sebelum upload ke Supabase Storage. Preview thumbnail grid setelah upload. Bisa hapus foto yang sudah diupload. |
| R04 | **Public: Catatan per tugas** | Text input muncul di task card. Optional — bisa diisi atau tidak. Tersimpan ke Supabase. |
| R05 | **Public: Lihat jadwal minggu ini** | Tab/halaman terpisah. Tabel 17 tugas × 7 hari, read-only. Horizontal scroll. Hari ini di-highlight. |
| R06 | **Admin: Login** | Email + password via Supabase Auth. Redirect ke /admin setelah login. Protected route — redirect ke login jika belum auth. |
| R07 | **Admin: Kelola jadwal mingguan** | Tabel editable. Dropdown per cell untuk assign staff. Auto-save atau tombol Save. Jadwal tersimpan per minggu (week_start_date sebagai key). |
| R08 | **Admin: Duplikasi jadwal** | Tombol "Copy dari Minggu Lalu". Confirmation dialog. Overwrite jadwal minggu ini. |
| R09 | **Admin: Dashboard rekap harian** | Pilih tanggal. Tampilkan: total tugas, completed, completion %. Breakdown per area. Breakdown per staff. List tugas yang belum selesai (highlight merah). |
| R10 | **Admin: Gallery foto** | Tampilkan foto per staff per hari. Before dan After side by side (atau stacked di mobile). Filter by tanggal dan staff. Tap untuk fullscreen. |
| R11 | **Mobile-first** | Optimal 360-414px. Touch target min 44×44px. No pinch-zoom needed. |

### P1 — Should Have (Sprint 2)

| ID | Requirement |
|----|------------|
| R12 | Admin: Rekap mingguan/bulanan — chart completion rate over time per staff |
| R13 | Admin: Manage task list (tambah/edit/hapus/reorder tugas) |
| R14 | Admin: Manage staff list (tambah/edit/hapus) |
| R15 | Admin: Editable SOP notes yang tampil di public page |
| R16 | Public: Navigasi hari (lihat checklist hari lain, tapi hanya hari ini yang bisa dicentang) |

### P2 — Future Consideration

| ID | Requirement |
|----|------------|
| R17 | Staff auth (PIN per staff untuk identifikasi lebih aman) |
| R18 | Laporan bulanan exportable (PDF) |
| R19 | Multi-week history navigation (kalender) |
| R20 | Realtime updates (Supabase Realtime — dashboard auto-refresh) |

---

## 8. Data Model (Supabase Postgres)

```sql
-- Staff list
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Task definitions
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('lt1', 'lt2', 'office', 'all')),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weekly schedule assignments
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Senin
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Senin of that week
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_id, day_of_week, week_start_date)
);

-- Check-ins (staff completing tasks)
CREATE TABLE checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checked_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_id, check_date)
);

-- Photo uploads (per staff per day, NOT per task)
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('before', 'after')),
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
```

### Supabase Storage Buckets

```
cleaning-photos/
  └── {YYYY-MM-DD}/
      └── {staff_name}/
          ├── before_{timestamp}.jpg
          ├── before_{timestamp}.jpg  (multiple allowed)
          ├── after_{timestamp}.jpg
          └── after_{timestamp}.jpg   (multiple allowed)
```

### Row Level Security (RLS)

- **staff, tasks, schedules**: Public read. Admin (authenticated) full CRUD.
- **checks**: Public insert + update (staff centang tanpa login). Admin read all.
- **photos**: Public insert (staff upload). Admin read all. Public read own uploads.
- **Supabase Storage**: Public upload to `cleaning-photos` bucket. Public read. Admin delete.

---

## 9. Page Structure

```
/ (Public)
├── / ..................... Staff selector → redirect to /piket?staff={name}
├── /piket ............... Checklist hari ini (filterable by staff)
├── /piket/jadwal ........ Jadwal minggu ini (read-only table)
│
/admin (Protected)
├── /admin/login ......... Login page
├── /admin ............... Dashboard rekap harian
├── /admin/jadwal ........ Edit jadwal mingguan
├── /admin/foto .......... Gallery foto
└── /admin/settings ...... Manage staff & tasks (P1)
```

---

## 10. UX Notes

### Public Page — Design Principles
- **Zero friction** — Staff pilih nama → langsung lihat tugas. Tidak ada login, tidak ada onboarding.
- **Big touch targets** — Card-based UI, centang button besar, camera button jelas.
- **Instant feedback** — Centang = card berubah hijau + timestamp muncul. Upload = thumbnail preview.
- **Minimal text input** — Catatan optional, bukan required.
- **Layout urutan** — (1) Checklist tugas grouped by area, lalu (2) di bawahnya dua panel foto: Before section dan After section. Foto tidak per task tapi per staff per hari. Multiple upload per panel.

### Admin Page — Design Principles
- **Data-dense tapi scannable** — Tabel jadwal padat tapi clear. Dashboard angka-angka besar.
- **Action-oriented** — Tombol duplikasi jadwal di tempat yang jelas. Filter yang gampang diakses.
- **Desktop-friendly tapi tetap works di mobile** — Jadwal editing lebih enak di laptop, tapi harus tetap bisa di HP.

---

## 11. Success Metrics

### Leading (1-2 minggu)

| Metrik | Target |
|--------|--------|
| Adoption | 4/4 staff pakai minggu pertama |
| Daily completion rate | >80% sebelum jam 12 siang |
| Foto upload rate | >60% tugas punya foto |
| Formulir kertas | 0 dicetak setelah minggu ke-2 |

### Lagging (1-2 bulan)

| Metrik | Target |
|--------|--------|
| Komplain kebersihan | Turun 50% |
| Waktu Dio cek operasional | -30 menit/hari |
| Data evaluasi | 4 minggu data untuk review bulanan pertama |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Staff malas pakai karena ribet | UX max 2-3 tap per tugas. Onboarding di briefing pagi. |
| HP lemot / storage penuh | Compress foto client-side. App ringan (no heavy deps). |
| WiFi resto mati | Supabase client punya built-in retry. Worst case: catat manual. |
| Supabase free tier limit | Free tier: 500MB DB, 1GB storage, 50K auth users — more than enough. Monitor usage. |
| Foto storage membengkak | Auto-compress. Retention policy: hapus foto >3 bulan (P2). |

---

## 13. Seed Data

### Tasks (17 tugas dari formulir kertas)

| # | Nama Tugas | Area |
|---|-----------|------|
| 1 | Tanaman Toilet & Area | lt1 |
| 2 | Lap Meja - All Area | all |
| 3 | Kaca (Lantai 1) | lt1 |
| 4 | Ambalan LT-1 | lt1 |
| 5 | Sapu (Lantai 1) | lt1 |
| 6 | Sapu & Pel Mushola | lt1 |
| 7 | Sapu & Pel Panggung | lt1 |
| 8 | Sapu & Pel Both Betawi, LT-1 | lt1 |
| 9 | Sawang-Sawang Atap LT-1 | lt1 |
| 10 | Sawang-Sawang Atap LT-2 | lt2 |
| 11 | Sapu Lantai 2 | lt2 |
| 12 | Kaca Lantai 2 | lt2 |
| 13 | Ambalan LT-2 | lt2 |
| 14 | Sapu Fiber/Genteng Lantai 2 | lt2 |
| 15 | Ruang Meeting (Cleaning) | office |
| 16 | Office (Cleaning) | office |
| 17 | Buang Sampah - All Area | all |

### Staff (4 orang)

Yusuf, Caca, Mitha, Tegar

### Default Schedule (dari foto formulir, Senin-Selasa)

Lihat foto asli formulir kertas sebagai referensi. Hari Rabu-Minggu belum diisi — admin set via app.

### SOP Notes

- Pastikan toilet kering, bersih dan wangi
- Kirim foto before & after ke grup service

---

*PRD v2.0 — Approved for Claude Code prompt generation.*
