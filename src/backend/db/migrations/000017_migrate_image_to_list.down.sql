ALTER TABLE wishes ADD COLUMN IF NOT EXISTS image varchar(512);

-- Переносим изображение на старый формат
UPDATE wishes
SET image = images[1]
WHERE array_length(images, 1) > 0;


ALTER TABLE wishes DROP COLUMN IF EXISTS images;
