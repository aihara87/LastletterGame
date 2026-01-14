# 🎮 Last Letter Game

Game kata multi-bahasa yang seru dan edukatif! Asah kemampuan kosakata Anda dengan permainan Last Letter, di mana setiap pemain harus menyebutkan kata yang dimulai dengan huruf terakhir dari kata sebelumnya.

**🌍 Now Available in English!**

## ✨ Fitur Utama

### 🌍 Multi-Language Support
- **Bahasa Indonesia (ID)**: 20+ kata awal
- **English (EN)**: 20+ initial words  
- **Language Switcher**: Ganti bahasa dengan satu klik
- **Separate Dictionaries**: Kamus terpisah per bahasa
- **Full UI Translation**: Semua elemen UI tersedia dalam kedua bahasa

### 🎯 Mode Permainan
- **Multiplayer (PvP)**: Bermain dengan 2-6 pemain
- **Vs Bot AI**: Tantang bot dengan 3 tingkat kesulitan (Mudah, Sedang, Sulit)
- **Online Mode**: Bermain jarak jauh dengan teman (in-memory room)

### 🎨 UI/UX Modern
- Design modern dan menarik dengan **Tailwind CSS**
- Gradient colors yang eye-catching
- Animasi smooth dan responsive
- Mobile-friendly

### 📚 Dictionary Management
- **Admin Dashboard** untuk mengelola dictionary kata
- **CRUD Operations**: Tambah, Edit, Hapus kata
- **Import JSON**: Upload file JSON untuk menambah kata secara bulk
- **Export JSON**: Download dictionary dalam format JSON
- Filter & Search kata
- Kategori kata (hewan, buah, tempat, dll)
- Dokumentasi lengkap format import

### ⏱️ Timer System
- **Timer per Giliran**: Waktu dapat diatur dari 10-120 detik
- **Visual Indicator**: Tampilan timer dengan color coding:
  - Hijau: > 15 detik
  - Kuning: 5-15 detik
  - Merah: < 5 detik (dengan animasi)
- Auto skip jika waktu habis

### 🤖 AI Bot Player
- Bot dengan strategi bermain yang cerdas
- 3 tingkat kesulitan:
  - **Mudah**: Memilih kata secara random
  - **Sedang**: Strategi yang seimbang
  - **Sulit**: Meminimalkan opsi lawan

### 🔐 Admin Authentication
- Login system untuk admin
- Protected admin routes
- Session management

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+ atau lebih baru
- npm atau yarn

### Instalasi

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Build untuk Production

```bash
# Build aplikasi
npm run build

# Preview production build
npm run preview
```

## 📖 Cara Bermain

1. **Pilih Mode Permainan**
   - Klik "Multiplayer" untuk bermain dengan teman
   - Atau klik "Vs Bot" untuk bermain melawan AI
   - Atau klik "Online" untuk bermain jarak jauh

2. **Setup Pemain**
   - Masukkan nama pemain
   - Untuk mode Bot, pilih tingkat kesulitan
   - **Aktifkan Timer** (opsional): Pilih durasi waktu per giliran (10-120 detik)

3. **Mulai Bermain**
   - Pemain pertama bebas memilih kata apapun
   - Pemain berikutnya harus menyebutkan kata yang dimulai dengan **huruf terakhir** dari kata sebelumnya
   - Kata harus ada dalam dictionary
   - Kata tidak boleh diulang

4. **Menang**
   - Pemain yang tidak bisa menemukan kata yang valid akan kalah
   - Pemain dengan skor tertinggi menang!

## 🔑 Admin Access

### Login Credentials (Demo)
```
http://[ip/domain]:port/admin/login
Username: admin
Password: admin123
```

### Fitur Admin Dashboard
- Lihat statistik dictionary
- Tambah kata baru secara manual
- Edit kata yang sudah ada
- Hapus kata dari dictionary
- **Import JSON**: Upload file JSON untuk menambah kata secara bulk
- **Export dictionary**: Download semua kata dalam format JSON
- Filter & search kata
- Manajemen kategori
- Pagination untuk data besar
- Dokumentasi lengkap cara import

## 📄 Import Dictionary JSON

### Format File JSON

Untuk import kata secara bulk, gunakan format JSON berikut:

```json
[
  {
    "word": "apel",
    "category": "buah",
    "language": "id"
  },
  {
    "word": "apple",
    "category": "fruit",
    "language": "en"
  }
]
```

### Aturan Import
- Field `word` wajib diisi
- Field `category` opsional
- Field `language` opsional ('id' atau 'en', default mengikuti kamus aktif)
- Kata duplikat akan diabaikan
- Kata kosong akan diabaikan  
- Huruf otomatis diubah ke lowercase
- Spasi di awal/akhir dihapus otomatis

### Download Contoh
File contoh tersedia di `/public/example-dictionary.json` atau download langsung dari admin dashboard.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Nuxt 4](https://nuxt.com/) - Vue.js framework untuk production
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons**: [@nuxt/icon](https://nuxt.com/modules/icon) - Icon module untuk Nuxt
- **State Management**: Nuxt useState composables
- **TypeScript**: Type-safe development
- **Context7**: Untuk dokumentasi module terbaru

## 📂 Struktur Project

```
app/
├── assets/
│   └── css/
│       └── main.css          # Tailwind CSS styles
├── composables/
│   ├── useAuth.ts            # Authentication logic
│   ├── useDictionary.ts      # Dictionary management
│   └── useGameState.ts       # Game state management
├── middleware/
│   └── auth.ts               # Auth middleware
├── pages/
│   ├── index.vue             # Home page (mode selection)
│   ├── game.vue              # Main game page
│   ├── online/               # Online mode pages
│   └── admin/
│       ├── login.vue         # Admin login
│       └── dashboard.vue     # Admin dashboard
├── utils/
│   └── botPlayer.ts          # AI bot logic
└── app.vue                   # Root component
```

## 🎯 Cara Kerja Game

### Last Letter Rule
Setiap kata harus dimulai dengan huruf terakhir dari kata sebelumnya.

**Contoh:**
1. Pemain 1: "ape**l**"
2. Pemain 2: "**l**emari"
3. Pemain 1: "**i**kan"
4. Pemain 2: "**n**anas"
5. Pemain 1: "**s**ekolah"

### Validasi Kata
- Kata harus ada dalam dictionary
- Kata tidak boleh diulang dalam satu game
- Kata harus dimulai dengan huruf yang benar (kecuali kata pertama)
- Jika timer aktif, pemain harus menjawab sebelum waktu habis

## 📝 Todo / Future Features

- [x] Timer per giliran dengan pengaturan durasi
- [x] Import dictionary dari file JSON
- [x] Multi-language Support
- [x] Online Multiplayer (In-Memory)
- [ ] Multiplayer online dengan Database/WebSocket (Persistent)
- [ ] Leaderboard global
- [ ] Sound effects
- [ ] Tema warna yang bisa diganti
- [ ] Achievement system

## 📄 License

MIT License

---

**Happy Gaming! 🎮**
