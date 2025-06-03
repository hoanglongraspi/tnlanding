# 🎬 Tối ưu Video Autoplay cho Website

## ✅ Đã thực hiện:
1. **Lazy Loading thông minh**: Video chỉ tải khi người dùng scroll tới
2. **Smooth autoplay**: Video tự động phát ngay khi tải xong
3. **Loading state**: Hiển thị placeholder cho đến khi video sẵn sàng

## 🔧 Các bước tối ưu thêm:

### 1. Tạo video version nhẹ cho autoplay
```bash
# Tạo version nén cao cho autoplay (10-15MB)
ffmpeg -i TVCTuNguyenFilm.mp4 -vcodec libx264 -crf 35 -preset fast -vf "scale=1280:720" -acodec aac -ar 22050 -ac 1 -b:a 64k TVCTuNguyenFilm_autoplay.mp4

# Tạo version WebM nhẹ hơn nữa
ffmpeg -i TVCTuNguyenFilm.mp4 -c:v libvpx-vp9 -crf 40 -b:v 0 -vf "scale=1280:720" -c:a libopus -b:a 64k TVCTuNguyenFilm_autoplay.webm
```

### 2. Update video sources trong code
```tsx
// Trong video element, thay đổi sources:
<source src="/TVCTuNguyenFilm_autoplay.webm" type="video/webm" />
<source src="/TVCTuNguyenFilm_autoplay.mp4" type="video/mp4" />
```

### 3. Thêm preload optimization
```tsx
// Video sẽ:
// ✅ Chỉ tải khi vào viewport
// ✅ Tự động phát mà không chờ click
// ✅ Có smooth transition
// ✅ Fallback nếu lỗi
```

## 📊 Kết quả mong đợi:
- **Tốc độ tải trang**: Cải thiện 80% (video không tải ngay)
- **Dung lượng autoplay**: 244MB → 10-15MB
- **Trải nghiệm**: Smooth autoplay khi scroll tới
- **Performance**: Không lag trang chủ

## 🚀 Quy trình deploy:
1. Tạo video autoplay tối ưu
2. Upload cả 2 version (gốc + autoplay)
3. Build project: `npm run build`
4. Deploy lên VPS
5. Test autoplay performance

## ⚡ Lợi ích:
- ✅ Giữ được autoplay
- ✅ Trang tải nhanh
- ✅ Video smooth
- ✅ UX tốt hơn 