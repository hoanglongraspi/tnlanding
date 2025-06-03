# Hướng dẫn tối ưu hóa Media cho Website

## 🎬 Tối ưu Video

### Sử dụng FFmpeg để nén video:

```bash
# Nén video xuống 50% chất lượng, giảm 70-80% dung lượng
ffmpeg -i TVCTuNguyenFilm.mp4 -vcodec libx264 -crf 28 -preset medium -acodec aac -ar 44100 -ac 2 TVCTuNguyenFilm_optimized.mp4

# Tạo version WebM (tối ưu hơn cho web)
ffmpeg -i TVCTuNguyenFilm.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus TVCTuNguyenFilm.webm

# Tạo poster image từ video
ffmpeg -i TVCTuNguyenFilm.mp4 -ss 00:00:02 -vframes 1 -q:v 2 video-poster.jpg
```

## 🖼️ Tối ưu Hình ảnh

### Nén ảnh JPG/PNG:

```bash
# Sử dụng ImageMagick
magick "ẢNH BÌA CTY.png" -quality 80 -resize 1920x1080> "ảnh-bìa-cty-optimized.jpg"
magick "DSCF3135.jpg" -quality 75 -resize 1920x1080> "DSCF3135-optimized.jpg"

# Hoặc sử dụng online tools:
# - TinyPNG.com
# - Squoosh.app
# - Optimizilla.com
```

## 📊 Kết quả mong đợi:
- Video: 244MB → 30-50MB (giảm 80%)
- Hình ảnh: 31MB → 2-4MB (giảm 85-90%)
- Tốc độ tải trang: Cải thiện 5-10x

## 🚀 Triển khai:
1. Tối ưu các file media
2. Thay thế file cũ bằng file mới
3. Build lại project: `npm run build`
4. Upload lên VPS 