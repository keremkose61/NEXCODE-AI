# NOVA IDE

> **Professional AI-Powered Windows Desktop IDE**
> *Designed for extreme speed, uncompromising privacy, and deep local intelligence.*

NOVA IDE is a modern, futuristic Windows desktop application engineered for high-velocity software engineering. Built on a concurrent 3-panel architecture, NOVA IDE couples the industry-standard Monaco Editor with an autonomous, 100% offline local artificial intelligence engine.

---

## 💎 Design Language & Visual Aesthetics

- **Futuristic & SaaS Developer Tool Look**: Dark obsidian base with purple (`#a855f7`), cyan (`#06b6d4`), and electric blue (`#3b82f6`) neon accents.
- **Complete Dual Theme System**:
  - **NOVA Dark**: Deep navy & midnight obsidian panels (`#080a10` / `#0d111b`) with glowing neon syntax and soft cybernetic drop-shadows.
  - **NOVA Light**: Soft platinum and clean white panels (`#f8fafc` / `#ffffff`) with vivid purple and electric blue contrast.
  - **One-Click Theme Toggle**: Instant global theme switching across all editor instances, panels, modals, and status bars.
- **Geometric Cyber Logo**: Custom `<>` coding brackets morphing into a central neural starburst diamond with multi-stop neon gradients.

---

## ⚡ 3-Panel Concurrent Layout

### 1. Sol Panel – Proje Gezgini (Project Explorer)
- **Dosya & Klasör Ağacı**: Uzantıya göre renklendirilmiş canlı dosya ikonları (TypeScript, Python, Rust, Go, CSS, JSON, SQL vb.).
- **Canlı Dosya Filtreleme**: Proje ağacı üzerinde anlık filtreleme arama kutusu.
- **Git Durum Rozetleri**: Değiştirilen (`M`), yeni eklenen (`U`) ve silinen (`D`) dosyalar için renkli durum göstergeleri.
- **Dosya İşlemleri**: Yeni dosya, yeni klasör oluşturma, yeniden adlandırma ve onaylı silme.

### 2. Orta Panel – Kod Editörü (Monaco Editor)
- **Monaco Editor Entegrasyonu**: VS Code çekirdeği ile tam uyumlu çevrimdışı editör.
- **Çoklu Dosya Sekmeleri**: Sürükleyip bırakarak sıralama (Drag & Drop), kapatma, kaydedilmemiş değişiklik göstergeleri.
- **Syntax Highlighting & Akıllı Tamamlama**: TypeScript, Python, Rust vb. için özel tema ve kod tamamlama.
- **Görsel Gezinme Yolu (Breadcrumbs)**: Çalışma klasörü ve aktif dosya yolu takibi.

### 3. Sağ Panel – AI Asistanı (Local Intelligence)
- **Yerel Model Seçimi**: Ollama tabanlı Qwen 2.5 Coder, DeepSeek Coder, Llama 3 desteği.
- **12 Özel Asistan Modu**: Kod Üretme, Açıklama, Hata Ayıklama & Düzeltme, Optimize Etme, Proje Analizi, Test Üretme.
- **Görsel Diff Önizlemesi**: Yapay zekâ tarafından önerilen kod değişikliklerini dosyaya uygulamadan önce yan yana Monaco Diff editöründe inceleme.
- **Kullanıcı Onay Kapısı**: Kullanıcının açık onayı olmadan hiçbir dosya otomatik değiştirilmez.
- **Multimodal & Ses Desteği**: Ekran görüntüsü / arayüz tasarımı ekleme ve Türkçe sesli dikte desteği.

---

## 🖥️ Entegre Terminal & Tanılama Paneli

- **Çoklu Terminal**: PowerShell ve Komut İstemi (CMD) sekmeleri.
- **Terminal Auto-Healer**: Terminaldeki derleme veya çalışma zamanı hatalarını anında yakalayan ve tek tıkla yapay zekâya teşhis ettiren akıllı kart.
- **Hata Ayıklama Konsolu (Debug REPL)**: Çalışma zamanı değişken ve ifade değerlendirme.
- **Problemler & Çıktı Paneli**: Derleyici hata ve uyarı listesi.

---

## 🔒 Gizlilik & Güvenlik Garantisi

- **100% Yerel Çalışma**: Yapay zekâ çıkarımları tamamen yerel donanımınız (CPU/GPU) üzerinde çalışır.
- **Sıfır Bulut Telemetrisi**: Kodlarınız veya istemleriniz hiçbir dış bulut servisine veya üçüncü taraf sunucuya aktarılmaz.
- **Sandbox İzolasyonu**: Hassas ortam değişkenleri (`.env`), anahtarlar ve sistem dosyaları sıkı güvenlik katmanlarıyla korunur.

---

## 🛠️ Kurulum & Paketleme

```bash
# Bağımlılıkları yükle
pnpm install

# Test paketlerini çalıştır (57/57 Vitest testleri)
pnpm test

# Masaüstü uygulamasını derle
pnpm --filter @nexcode/desktop build

# Windows Installer (.exe) ve Taşınabilir (Portable) paket oluştur
pnpm --filter @nexcode/desktop run package:win
```

---

## 📜 Lisans & Telif Hakkı

Copyright © 2026 NOVA IDE Team. Kodlarınızı güvenle yazın, yerel zekâyla geleceği inşa edin.
