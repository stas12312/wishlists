package impl

import (
	"github.com/gofiber/fiber/v2/log"
	"github.com/h2non/bimg"
)

const maxImageSide = 1600

func convertImage(image []byte) ([]byte, error) {
	log.Info("Конвертация изображения")
	source := bimg.NewImage(image)
	metadata, err := source.Metadata()
	if err != nil {
		return nil, err
	}

	options := bimg.Options{
		Type: bimg.WEBP,
		// bimg поворачивает пиксели по EXIF, но тег ориентации оставляет, и повторная
		// обработка повернула бы картинку ещё раз. Профиль переводим в sRGB, чтобы без него не поплыли цвета
		StripMetadata: true,
		OutputICC:     "srgb",
		// Браузеры не применяют EXIF-ориентацию к webp, а у наших старых webp тег остался от поворота выше
		NoAutoRotate: metadata.Type == "webp",
	}

	width, height := metadata.Size.Width, metadata.Size.Height
	// Для EXIF-ориентаций 5–8 bimg поворачивает картинку на 90° до ресайза
	if !options.NoAutoRotate && metadata.Orientation >= 5 {
		width, height = height, width
	}

	// Задаём только одну сторону: при обеих bimg растягивает картинку под них
	if width >= height && width > maxImageSide {
		options.Width = maxImageSide
	} else if height > width && height > maxImageSide {
		options.Height = maxImageSide
	}

	return source.Process(options)
}
