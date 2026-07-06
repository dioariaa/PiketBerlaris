-- Migrasi untuk database yang sudah dibuat dengan schema v1.
-- Foto sekarang pool per tanggal (bukan per staff), staff_id boleh NULL.
-- Jalankan sekali di Supabase SQL Editor.

ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_staff_id_fkey;
ALTER TABLE photos
  ADD CONSTRAINT photos_staff_id_fkey
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;
