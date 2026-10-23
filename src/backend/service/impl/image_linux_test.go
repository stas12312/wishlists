package impl

import (
	"bytes"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"testing"

	"github.com/h2non/bimg"
)

// Белая картинка с красной левой верхней четвертью: по ней видно, куда повернулось содержимое
func makeJPEG(t *testing.T, width, height int) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			if x < width/2 && y < height/2 {
				img.Set(x, y, color.RGBA{R: 255, A: 255})
			} else {
				img.Set(x, y, color.White)
			}
		}
	}
	var buffer bytes.Buffer
	if err := jpeg.Encode(&buffer, img, nil); err != nil {
		t.Fatal(err)
	}
	return buffer.Bytes()
}

// Вставляет после SOI минимальный EXIF-сегмент с одним тегом Orientation
func withOrientation(jpegBytes []byte, orientation byte) []byte {
	exif := []byte{
		0xFF, 0xE1, 0x00, 0x22,
		'E', 'x', 'i', 'f', 0x00, 0x00,
		'I', 'I', 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
		0x01, 0x00,
		0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00,
	}
	result := append([]byte{}, jpegBytes[:2]...)
	result = append(result, exif...)
	return append(result, jpegBytes[2:]...)
}

type redCorner int

const (
	topLeft redCorner = iota
	topRight
)

func checkConverted(t *testing.T, converted []byte, wantWidth, wantHeight int, wantCorner redCorner) {
	t.Helper()
	metadata, err := bimg.Metadata(converted)
	if err != nil {
		t.Fatal(err)
	}
	if metadata.Type != "webp" {
		t.Fatalf("type = %v, want webp", metadata.Type)
	}
	if metadata.Orientation > 1 {
		t.Errorf("orientation = %d, want no rotation", metadata.Orientation)
	}

	pngBytes, err := bimg.NewImage(converted).Process(bimg.Options{Type: bimg.PNG, NoAutoRotate: true})
	if err != nil {
		t.Fatal(err)
	}
	decoded, err := png.Decode(bytes.NewReader(pngBytes))
	if err != nil {
		t.Fatal(err)
	}

	bounds := decoded.Bounds()
	if bounds.Dx() != wantWidth || bounds.Dy() != wantHeight {
		t.Fatalf("size = %dx%d, want %dx%d", bounds.Dx(), bounds.Dy(), wantWidth, wantHeight)
	}

	isRed := func(x, y int) bool {
		r, g, b, _ := decoded.At(x, y).RGBA()
		return r > 0xC000 && g < 0x4000 && b < 0x4000
	}
	leftRed, rightRed := isRed(wantWidth/4, wantHeight/4), isRed(wantWidth*3/4, wantHeight/4)
	if (wantCorner == topLeft) != leftRed || (wantCorner == topRight) != rightRed {
		t.Errorf("red top-left = %v, top-right = %v, want corner %v", leftRed, rightRed, wantCorner)
	}
}

func TestConvertImage(t *testing.T) {
	tests := []struct {
		name        string
		width       int
		height      int
		orientation byte
		wantWidth   int
		wantHeight  int
		wantCorner  redCorner
	}{
		{name: "Вертикальная больше лимита", width: 3000, height: 4000, wantWidth: 1200, wantHeight: 1600},
		{name: "Горизонтальная больше лимита", width: 4000, height: 2000, wantWidth: 1600, wantHeight: 800},
		{name: "Одна сторона больше лимита", width: 1000, height: 3200, wantWidth: 500, wantHeight: 1600},
		{name: "Меньше лимита не увеличивается", width: 800, height: 600, wantWidth: 800, wantHeight: 600},
		{
			name: "Повёрнутая через EXIF", width: 4000, height: 3000, orientation: 6,
			wantWidth: 1200, wantHeight: 1600, wantCorner: topRight,
		},
		{
			name: "Повёрнутая через EXIF меньше лимита", width: 800, height: 600, orientation: 6,
			wantWidth: 600, wantHeight: 800, wantCorner: topRight,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			source := makeJPEG(t, tt.width, tt.height)
			if tt.orientation != 0 {
				source = withOrientation(source, tt.orientation)
			}

			converted, err := convertImage(source)
			if err != nil {
				t.Fatal(err)
			}
			checkConverted(t, converted, tt.wantWidth, tt.wantHeight, tt.wantCorner)

			// Наши же картинки могут загрузить повторно, например по ссылке: результат не должен меняться
			reconverted, err := convertImage(converted)
			if err != nil {
				t.Fatal(err)
			}
			checkConverted(t, reconverted, tt.wantWidth, tt.wantHeight, tt.wantCorner)
		})
	}
}

func TestConvertImage_LegacyWebpWithStaleOrientation(t *testing.T) {
	// Так выглядят картинки, загруженные до исправления: пиксели уже повёрнуты, а тег остался
	legacy, err := bimg.NewImage(withOrientation(makeJPEG(t, 3000, 4000), 6)).
		Process(bimg.Options{Type: bimg.WEBP, NoAutoRotate: true})
	if err != nil {
		t.Fatal(err)
	}
	if metadata, _ := bimg.Metadata(legacy); metadata.Orientation != 6 {
		t.Fatalf("legacy orientation = %d, want 6", metadata.Orientation)
	}

	converted, err := convertImage(legacy)
	if err != nil {
		t.Fatal(err)
	}
	checkConverted(t, converted, 1200, 1600, topLeft)
}
