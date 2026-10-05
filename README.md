# HaydiOyna (haydioyna.com)

Kameralı, vücut hareketiyle oynanan Türkçe çocuk oyunları. Kurulum ya da derleme gerektirmez; tamamen statik bir sitedir.

## Çalıştırma

`index.html` dosyasına çift tıklamak yeterli. İstersen yerel sunucuyla da açabilirsin:

```bash
cd haydioyna
npm start        # http://localhost:8765
```

Kodu (`js/` altı) değiştirdikten sonra tek dosyalık paketi yenile:

```bash
npm run build    # js/haydioyna.bundle.js
```

Yayına almak için klasörü olduğu gibi herhangi bir statik sunucuya (Netlify, Vercel, Cloudflare Pages, GitHub Pages, kendi Nginx'iniz) HTTPS ile yükleyin.

## Oyunlar (hepsi 1 ve 2 kişilik)

| Oyun | Kontrol |
|---|---|
| Kapadokya Balonları | Eller / kafa ile balon patlat |
| Hezarfen'in Uçuşu | Kolları aç ve eğ, halkalardan geç |
| Minik Lokanta | Malzemelere sırayla dokun |
| Bahçe Hasadı | Meyvelere uzan, düşenleri yakala |
| Pars Hoca'nın Salonu | Poz taklidi, kuşak kazan |
| Köy Yolu Motokros | Sağa-sola adım at, zıpla |
| Palandöken Kayak | Kolları aç ve eğ, tepede zıpla |
| Anadolu Hız Treni | Yıldızlara uzan, inişte eller yukarı |
| Sihirli Çini | Noktaları sırayla birleştir |

Kamera olmadan test etmek için: `#/oyna/<oyun>/fare` (fare = el, ok tuşları = eğilme, boşluk = zıplama, yukarı ok = eller yukarı).

## Yapı

- `js/pose.js`: Kamera ve MediaPipe Pose Landmarker (lite). 2 kişilik modda soldaki kişi 1. oyuncu, sağdaki 2. oyuncu olur.
- `js/handcursor.js`: Menülerde el imleci; düğme üstünde el tutulunca tıklar.
- `js/engine.js`: Oyun döngüsü, bölünmüş ekran, hareketten giriş üretme (eller, kafa, eğim, zıplama, eller yukarı), geri sayım, skor ve yıldız.
- `js/games/*.js`: Her oyun `create(view)` ile bir örnek döndürür (`update`, `draw`, `drawOver`, `score`). Yeni oyun eklemek için `js/app.js` içindeki `GAMES` listesine ekleyin.
- Tüm grafikler canvas ile kodda çizilir (yiyecek simgeleri sistem emojisidir). Dışarıdan görsel dosyası yoktur.
