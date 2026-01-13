ALTER TABLE wishes ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[];

-- Переносим изображение на новый формат
UPDATE wishes
SET images = ARRAY[image]
WHERE image != '';

-- Удаляем старую колонку
ALTER TABLE wishes DROP COLUMN IF EXISTS image;