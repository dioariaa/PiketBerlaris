-- ============================================================
-- Berlaris Piket - Database Setup
-- Jalankan di Supabase Dashboard -> SQL Editor
-- ============================================================

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

-- Photo uploads (per day, NOT per task, NOT per staff)
-- staff_id nullable karena public page tidak ada login
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
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

-- ============================================================
-- Row Level Security
-- ============================================================

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

-- ============================================================
-- Storage policies
-- (Buat bucket PUBLIC bernama 'cleaning-photos' dulu di
--  Dashboard -> Storage -> New bucket)
-- ============================================================

CREATE POLICY "Public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cleaning-photos');
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'cleaning-photos');
CREATE POLICY "Admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'cleaning-photos' AND auth.role() = 'authenticated');
