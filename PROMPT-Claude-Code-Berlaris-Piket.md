# Claude Code Prompt: Berlaris Piket — Sistem Checklist Kebersihan Digital

## Context

Kamu sedang membangun web app untuk mengelola jadwal piket kebersihan harian di Berlaris Kopi & Resto. App ini menggantikan formulir kertas yang digunakan 4 staff operasional (Yusuf, Caca, Mitha, Tegar) untuk 17 tugas kebersihan harian.

App punya dua interface:
- **Public** (`/`): Staff centang tugas + upload foto. Tanpa login.
- **Admin** (`/admin`): Manager atur jadwal, lihat rekap, review foto. Dilindungi login.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend/DB/Auth/Storage**: Supabase
  - Postgres database
  - Supabase Auth (admin login only)
  - Supabase Storage (foto before/after)
  - Row Level Security (RLS)
- **Deploy**: Vercel
- **Package Manager**: npm

## Project Setup

```bash
npm create vite@latest berlaris-piket -- --template react
cd berlaris-piket
npm install @supabase/supabase-js react-router-dom browser-image-compression
npm install -D tailwindcss @tailwindcss/vite
```

Tailwind config di `vite.config.js`:
```js
import tailwindcss from '@tailwindcss/vite'
// tambahkan tailwindcss() ke plugins array
```

File `.env`:
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Database Schema (Supabase SQL Editor)

Jalankan SQL ini di Supabase SQL Editor untuk setup database:

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
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Senin, 6=Minggu
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

-- Seed: Staff
INSERT INTO staff (name) VALUES ('Yusuf'), ('Caca'), ('Mitha'), ('Tegar');

-- Seed: Tasks (17 tugas, ordered by area)
INSERT INTO tasks (name, area, sort_order) VALUES
  ('Tanaman Toilet & Area', 'lt1', 1),
  ('Lap Meja - All Area', 'all', 2),
  ('Kaca (Lantai 1)', 'lt1', 3),
  ('Ambalan LT-1', 'lt1', 4),
  ('Sapu (Lantai 1)', 'lt1', 5),
  ('Sapu & Pel Mushola', 'lt1', 6),
  ('Sapu & Pel Panggung', 'lt1', 7),
  ('Sapu & Pel Both Betawi, LT-1', 'lt1', 8),
  ('Sawang-Sawang Atap LT-1', 'lt1', 9),
  ('Sawang-Sawang Atap LT-2', 'lt2', 10),
  ('Sapu Lantai 2', 'lt2', 11),
  ('Kaca Lantai 2', 'lt2', 12),
  ('Ambalan LT-2', 'lt2', 13),
  ('Sapu Fiber/Genteng Lantai 2', 'lt2', 14),
  ('Ruang Meeting (Cleaning)', 'office', 15),
  ('Office (Cleaning)', 'office', 16),
  ('Buang Sampah - All Area', 'all', 17);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- staff & tasks: public read, admin write
CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Admin manage staff" ON staff FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Admin manage tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');

-- schedules: public read, admin write
CREATE POLICY "Public read schedules" ON schedules FOR SELECT USING (true);
CREATE POLICY "Admin manage schedules" ON schedules FOR ALL USING (auth.role() = 'authenticated');

-- checks: public insert/update/read (staff centang tanpa login), admin full
CREATE POLICY "Public read checks" ON checks FOR SELECT USING (true);
CREATE POLICY "Public insert checks" ON checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update checks" ON checks FOR UPDATE USING (true);
CREATE POLICY "Public delete checks" ON checks FOR DELETE USING (true);

-- photos: public insert/read, admin delete
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public insert photos" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete photos" ON photos FOR DELETE USING (auth.role() = 'authenticated');
```

### Supabase Storage

Buat bucket `cleaning-photos` di Supabase Dashboard → Storage:
- Public bucket (allow public read)
- File path format: `{YYYY-MM-DD}/{staff_name}/{before|after}_{timestamp}.jpg`

Storage policies:
```sql
-- Allow public uploads
CREATE POLICY "Public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cleaning-photos');
-- Allow public read
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'cleaning-photos');
-- Admin delete
CREATE POLICY "Admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'cleaning-photos' AND auth.role() = 'authenticated');
```

## File Structure

```
src/
├── main.jsx
├── App.jsx                    # Router setup
├── lib/
│   └── supabase.js            # Supabase client init
├── hooks/
│   ├── useStaff.js            # Fetch staff list
│   ├── useTasks.js            # Fetch tasks
│   ├── useSchedule.js         # Fetch/update schedule for a week
│   ├── useChecks.js           # Fetch/toggle checks for a date
│   ├── usePhotos.js           # Fetch/upload/delete photos
│   └── useAuth.js             # Supabase auth state
├── pages/
│   ├── public/
│   │   ├── StaffSelect.jsx    # Landing: pick your name
│   │   ├── Piket.jsx          # Checklist + foto panels
│   │   └── JadwalView.jsx     # Read-only weekly schedule
│   └── admin/
│       ├── Login.jsx          # Admin login
│       ├── Dashboard.jsx      # Daily recap
│       ├── JadwalEdit.jsx     # Edit weekly schedule
│       └── Gallery.jsx        # Photo gallery
├── components/
│   ├── TaskCard.jsx           # Single task with checkbox
│   ├── PhotoPanel.jsx         # Before/After upload panel
│   ├── ProgressBar.jsx        # Completion progress
│   ├── AreaGroup.jsx          # Task group by area
│   ├── DaySelector.jsx        # Day picker (Senin-Minggu)
│   ├── ProtectedRoute.jsx     # Auth guard for admin
│   └── Layout.jsx             # Shared layout/nav
└── utils/
    ├── dates.js               # Week start calc, day names, formatting
    └── imageCompress.js       # Client-side image compression
```

## Routing (App.jsx)

```
react-router-dom v6:

/                → StaffSelect (public)
/piket           → Piket (public, query param ?staff=Yusuf)
/piket/jadwal    → JadwalView (public, read-only)
/admin/login     → Login
/admin           → Dashboard (protected)
/admin/jadwal    → JadwalEdit (protected)
/admin/foto      → Gallery (protected)
```

Gunakan `<ProtectedRoute>` wrapper yang cek `useAuth()` — redirect ke `/admin/login` jika belum authenticated.

## Detailed Feature Specs

### 1. Public: Staff Select (`/`)

Halaman pertama yang dilihat staff saat buka app.

- Tampilkan heading "Berlaris Piket" dan tanggal hari ini
- 4 tombol besar (card) dengan nama staff: Yusuf, Caca, Mitha, Tegar
- Tap nama → navigate ke `/piket?staff={name}`
- Simpan pilihan di localStorage supaya next time langsung ke checklist
- Ada tombol "Lihat Jadwal Minggu Ini" → navigate ke `/piket/jadwal`

**UI**: Mobile-first, card-based, warna hijau gelap (#1B4332) sebagai primary. Font besar, touch target min 44×44px.

### 2. Public: Piket / Checklist (`/piket?staff={name}`)

Halaman utama staff sehari-hari. Layout scroll vertikal:

**Section 1: Header**
- Nama staff yang dipilih + tanggal hari ini
- Tombol ganti staff (kembali ke `/`)
- Progress bar: X/Y tugas selesai

**Section 2: Checklist Tugas (atas)**
- Fetch schedule hari ini (berdasarkan day_of_week + current week_start_date)
- Filter: tampilkan hanya tugas yang di-assign ke staff ini
- Ada toggle "Lihat Semua" untuk lihat semua tugas (termasuk staff lain)
- Tugas di-group by area:
  - **Lantai 1** (warna: #2D6A4F)
  - **Lantai 2** (warna: #40916C)
  - **Office** (warna: #52B788)
  - **Semua Area** (warna: #95D5B2)
- Setiap tugas = card dengan:
  - Checkbox (tap to toggle)
  - Nama tugas
  - Nama staff yang di-assign (kalau mode "Lihat Semua")
  - Timestamp saat dicentang (muncul setelah centang)
  - Optional: input catatan (text, muncul setelah expand card)
- Centang tugas → INSERT ke tabel `checks` (task_id, staff_id, check_date, checked_at)
- Uncheck → DELETE dari tabel `checks`
- Card yang sudah dicentang: background hijau muda, strikethrough text

**Section 3: Foto Before/After (bawah)**
- Dua panel side by side (atau stacked di layar kecil):
  - **Panel Before**: heading "Before", tombol kamera/upload, thumbnail grid foto yang sudah diupload
  - **Panel After**: heading "After", tombol kamera/upload, thumbnail grid foto yang sudah diupload
- Foto terikat ke staff + tanggal (BUKAN per task)
- Multiple upload per panel (bebas jumlah)
- Flow upload:
  1. Tap tombol → `<input type="file" accept="image/*" capture="environment">` (buka kamera) atau pilih dari gallery
  2. Client-side compress pakai `browser-image-compression` (maxWidthOrHeight: 800, maxSizeMB: 0.5)
  3. Upload ke Supabase Storage: `cleaning-photos/{YYYY-MM-DD}/{staff_name}/{before|after}_{timestamp}.jpg`
  4. INSERT ke tabel `photos` (staff_id, photo_date, type, storage_path)
  5. Tampilkan thumbnail preview
- Tap thumbnail → fullscreen view
- Bisa hapus foto (tombol X di thumbnail) → DELETE dari photos + storage

**Catatan SOP** (paling bawah):
- Box kuning dengan text:
  - "Pastikan toilet kering, bersih dan wangi"
  - "Kirim foto before & after ke grup service"

### 3. Public: Jadwal Minggu Ini (`/piket/jadwal`)

- Tabel read-only: 17 tugas (rows) × 7 hari (columns)
- Header kolom: Sen, Sel, Rab, Kam, Jum, Sab, Min
- Setiap cell: nama staff atau "–" jika kosong
- Hari ini di-highlight (background berbeda)
- Area ditandai dengan dot warna di samping nama tugas
- Horizontal scroll untuk mobile
- Sticky first column (nama tugas)
- Tombol back ke checklist

### 4. Admin: Login (`/admin/login`)

- Form sederhana: email + password
- Submit → `supabase.auth.signInWithPassword()`
- Success → redirect ke `/admin`
- Error → tampilkan error message
- Style: centered card, clean, minimal

### 5. Admin: Dashboard Rekap Harian (`/admin`)

- **Date picker** di atas (default: hari ini)
- **Summary cards**:
  - Total tugas hari itu (dari schedule)
  - Tugas selesai (dari checks)
  - Completion rate (%)
  - Foto uploaded count
- **Breakdown per area**: mini progress bar per area (LT1, LT2, Office, All)
- **Breakdown per staff**: card per staff showing:
  - Assigned tasks count
  - Completed tasks count
  - Completion %
  - Donut/ring chart sederhana (CSS only, no chart library)
- **Tugas belum selesai**: list tugas yang belum dicentang, highlight merah/oranye
- **Preview foto hari itu**: thumbnail grid, grouped by staff → before | after
  - Tap thumbnail → fullscreen

### 6. Admin: Edit Jadwal Mingguan (`/admin/jadwal`)

- **Week picker**: navigasi per minggu (< Minggu Lalu | 30 Jun - 6 Jul 2026 | Minggu Depan >)
- **Tabel editable**: 17 tugas (rows) × 7 hari (columns)
  - Setiap cell = dropdown `<select>` dengan opsi: kosong, Yusuf, Caca, Mitha, Tegar
  - Perubahan → upsert ke tabel `schedules` (task_id, day_of_week, staff_id, week_start_date)
- **Tombol "Duplikasi dari Minggu Lalu"**:
  - Fetch schedule minggu sebelumnya
  - Confirmation dialog: "Duplikasi jadwal dari [tanggal]? Jadwal minggu ini akan di-overwrite."
  - Jika confirm: delete semua schedule minggu ini → insert copy dari minggu lalu dengan week_start_date yang baru
- **Auto-save** setiap cell change (debounce 500ms), atau tombol Save explicit — pilih yang lebih reliable
- Horizontal scroll + sticky first column untuk mobile

### 7. Admin: Gallery Foto (`/admin/foto`)

- **Filter**: date picker + staff dropdown (All / per staff)
- **Layout**: per staff section, each showing:
  - Staff name header
  - Two columns: Before photos | After photos
  - Thumbnail grid
  - Tap → fullscreen overlay
- **Empty state**: "Belum ada foto untuk tanggal ini"

## Utility Functions

### dates.js
```js
// Nama hari dalam Bahasa Indonesia
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// Get Monday of current week
function getWeekStart(date = new Date()) { ... }

// Get day_of_week index (0=Senin, 6=Minggu)
function getDayIndex(date = new Date()) { ... }

// Format date to YYYY-MM-DD
function formatDate(date) { ... }

// Format date to "6 Jul 2026" (Indonesian)
function formatDateID(date) { ... }
```

### imageCompress.js
```js
import imageCompression from 'browser-image-compression';

async function compressImage(file) {
  return await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  });
}
```

## Design System

### Colors
- Primary dark: `#1B4332`
- Primary: `#2D6A4F`
- Primary light: `#40916C`
- Accent: `#52B788`
- Accent light: `#95D5B2`
- Surface light: `#D8F3DC`
- Background: `#FAFAFA`
- Card: `#FFFFFF`
- Checked card: `#F0FFF4`
- Danger: `#E74C3C`
- Warning bg: `#FFF8E1`
- Warning border: `#FFE082`
- Text primary: `#333333`
- Text secondary: `#666666`
- Text muted: `#999999`
- Border: `#E8E8E8`

### Area Colors
- lt1: `#2D6A4F`
- lt2: `#40916C`
- office: `#52B788`
- all: `#95D5B2`

### Typography
- Font: Inter (via Google Fonts) with system fallbacks
- Heading: 18px, 700 weight
- Body: 14px, 400-500 weight
- Caption: 11-12px, 600 weight
- Area labels: 11px, 700 weight, uppercase, letter-spacing 0.5px

### Spacing & Touch
- Card padding: 14-16px
- Card border-radius: 12px
- Touch target minimum: 44×44px
- Checkbox visual size: 28×28px, border-radius 8px
- Bottom nav height: ~56px + safe-area-inset-bottom

## Mobile-First Constraints

- Max-width container: 480px (centered)
- No pinch-zoom needed
- Bottom navigation (public): Piket | Jadwal
- Bottom navigation (admin): Rekap | Jadwal | Foto
- Horizontal scroll for schedule tables with sticky first column
- `input[type="file"]` with `capture="environment"` for camera access
- `WebkitOverflowScrolling: touch` for smooth scroll on mobile

## Development Order

Bangun dalam urutan ini supaya setiap step bisa di-test:

1. **Setup**: Vite + React + Tailwind + Supabase client + React Router
2. **Database**: Run SQL schema + seed data di Supabase
3. **Hooks**: useStaff, useTasks, useSchedule, useChecks, usePhotos, useAuth
4. **Public pages**: StaffSelect → Piket (checklist + foto panels) → JadwalView
5. **Admin pages**: Login → Dashboard → JadwalEdit → Gallery
6. **Polish**: Loading states, error handling, empty states, responsive fine-tuning
7. **Deploy**: Vercel connect GitHub repo, set env vars

## Important Notes

- Semua text UI dalam Bahasa Indonesia
- Timezone: Asia/Jakarta (WIB, UTC+7) — penting untuk date calculations
- Week starts on Monday (Senin), bukan Sunday
- `day_of_week`: 0=Senin, 1=Selasa, ..., 6=Minggu (BUKAN JS default yang 0=Sunday)
- Foto di-compress client-side SEBELUM upload ke Supabase Storage
- Supabase client: gunakan `createClient` dari `@supabase/supabase-js` dengan env vars
- Untuk admin auth: buat user manual di Supabase Dashboard → Authentication → Users
- RLS harus di-enable dan policies di-apply SEBELUM testing, otherwise queries akan return empty
