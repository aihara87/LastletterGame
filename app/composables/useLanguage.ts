export type Language = 'id' | 'en'

interface Translations {
  [key: string]: {
    id: string
    en: string
  }
}

const translations: Translations = {
  // Header
  'app.title': {
    id: 'Last Letter Game',
    en: 'Last Letter Game'
  },
  'app.subtitle': {
    id: 'Asah kemampuan kosakata Anda dengan permainan kata yang seru!',
    en: 'Sharpen your vocabulary skills with an exciting word game!'
  },
  
  // Mode Selection
  'mode.multiplayer': {
    id: 'Multiplayer',
    en: 'Multiplayer'
  },
  'mode.multiplayer.desc': {
    id: 'Bermain dengan 2 pemain atau lebih',
    en: 'Play with 2 or more players'
  },
  'mode.bot': {
    id: 'Vs Bot',
    en: 'Vs Bot'
  },
  'mode.bot.desc': {
    id: 'Tantang bot AI dengan berbagai tingkat kesulitan',
    en: 'Challenge AI bot with various difficulty levels'
  },
  
  // Setup
  'setup.player': {
    id: 'Setup Pemain',
    en: 'Player Setup'
  },
  'setup.game': {
    id: 'Setup Game',
    en: 'Game Setup'
  },
  'setup.playerName': {
    id: 'Nama Pemain',
    en: 'Player Name'
  },
  'setup.yourName': {
    id: 'Nama Anda',
    en: 'Your Name'
  },
  'setup.difficulty': {
    id: 'Tingkat Kesulitan Bot',
    en: 'Bot Difficulty Level'
  },
  'setup.difficulty.easy': {
    id: 'Mudah',
    en: 'Easy'
  },
  'setup.difficulty.medium': {
    id: 'Sedang',
    en: 'Medium'
  },
  'setup.difficulty.hard': {
    id: 'Sulit',
    en: 'Hard'
  },
  'setup.addPlayer': {
    id: 'Tambah Pemain',
    en: 'Add Player'
  },
  
  // Timer
  'timer.enable': {
    id: 'Aktifkan Timer',
    en: 'Enable Timer'
  },
  'timer.perTurn': {
    id: 'Waktu per Giliran',
    en: 'Time per Turn'
  },
  'timer.seconds': {
    id: 'detik',
    en: 'seconds'
  },
  'timer.info': {
    id: 'Timer akan dimulai setiap giliran pemain. Jika waktu habis, giliran akan dilewati.',
    en: 'Timer will start each player turn. If time runs out, the turn will be skipped.'
  },
  'timer.remaining': {
    id: 'Waktu Tersisa',
    en: 'Time Remaining'
  },
  
  // Game
  'game.start': {
    id: 'Mulai Permainan',
    en: 'Start Game'
  },
  'game.quit': {
    id: 'Keluar',
    en: 'Quit'
  },
  'game.mode': {
    id: 'Mode',
    en: 'Mode'
  },
  'game.turn': {
    id: 'Giliran',
    en: 'Turn'
  },
  'game.lastWord': {
    id: 'Kata Terakhir',
    en: 'Last Word'
  },
  'game.mustStartWith': {
    id: 'Harus Dimulai Dengan',
    en: 'Must Start With'
  },
  'game.score': {
    id: 'Skor Pemain',
    en: 'Player Score'
  },
  'game.enterWord': {
    id: 'Masukkan Kata',
    en: 'Enter Word'
  },
  'game.typeWord': {
    id: 'Ketik kata Anda...',
    en: 'Type your word...'
  },
  'game.send': {
    id: 'Kirim Kata',
    en: 'Send Word'
  },
  'game.history': {
    id: 'Riwayat Permainan',
    en: 'Game History'
  },
  'game.noWords': {
    id: 'Belum ada kata yang dimainkan',
    en: 'No words played yet'
  },
  'game.botThinking': {
    id: 'Bot sedang berpikir...',
    en: 'Bot is thinking...'
  },
  
  // Game Over
  'game.over': {
    id: 'Game Over!',
    en: 'Game Over!'
  },
  'game.cannotFind': {
    id: 'tidak bisa menemukan kata!',
    en: "couldn't find a word!"
  },
  'game.playAgain': {
    id: 'Main Lagi',
    en: 'Play Again'
  },
  'game.backHome': {
    id: 'Kembali ke Home',
    en: 'Back to Home'
  },
  
  // Errors
  'error.empty': {
    id: 'Kata tidak boleh kosong!',
    en: 'Word cannot be empty!'
  },
  'error.wrongLetter': {
    id: 'Kata harus dimulai dengan huruf',
    en: 'Word must start with letter'
  },
  'error.notInDict': {
    id: 'Kata tidak ada dalam kamus!',
    en: 'Word not in dictionary!'
  },
  'error.alreadyUsed': {
    id: 'Kata sudah pernah digunakan!',
    en: 'Word already used!'
  },
  'error.mustStartInfo': {
    id: 'Kata harus dimulai dengan huruf:',
    en: 'Word must start with letter:'
  },
  
  // Admin
  'admin.dashboard': {
    id: 'Admin Dashboard',
    en: 'Admin Dashboard'
  },
  'admin.login': {
    id: 'Admin Login',
    en: 'Admin Login'
  },
  'admin.username': {
    id: 'Username',
    en: 'Username'
  },
  'admin.password': {
    id: 'Password',
    en: 'Password'
  },
  'admin.loginBtn': {
    id: 'Masuk',
    en: 'Login'
  },
  'admin.logout': {
    id: 'Logout',
    en: 'Logout'
  },
  'admin.manageDictionary': {
    id: 'Kelola dictionary kata untuk game',
    en: 'Manage word dictionary for the game'
  },
  'admin.toGame': {
    id: 'Ke Game',
    en: 'To Game'
  },
  
  // Statistics
  'stats.totalWords': {
    id: 'Total Kata',
    en: 'Total Words'
  },
  'stats.categories': {
    id: 'Kategori',
    en: 'Categories'
  },
  'stats.addedToday': {
    id: 'Ditambahkan Hari Ini',
    en: 'Added Today'
  },
  'stats.admin': {
    id: 'Admin',
    en: 'Admin'
  },
  
  // Dictionary Management
  'dict.addNew': {
    id: 'Tambah Kata Baru',
    en: 'Add New Word'
  },
  'dict.editWord': {
    id: 'Edit Kata',
    en: 'Edit Word'
  },
  'dict.word': {
    id: 'Kata',
    en: 'Word'
  },
  'dict.enterWord': {
    id: 'Masukkan kata...',
    en: 'Enter word...'
  },
  'dict.category': {
    id: 'Kategori',
    en: 'Category'
  },
  'dict.categoryOptional': {
    id: 'Kategori (Opsional)',
    en: 'Category (Optional)'
  },
  'dict.categoryExample': {
    id: 'Contoh: hewan, buah, tempat...',
    en: 'Example: animal, fruit, place...'
  },
  'dict.add': {
    id: 'Tambah',
    en: 'Add'
  },
  'dict.update': {
    id: 'Update',
    en: 'Update'
  },
  'dict.language': {
    id: 'Bahasa Kamus',
    en: 'Dictionary Language'
  },
  'dict.language.id': {
    id: 'Bahasa Indonesia',
    en: 'Indonesian'
  },
  'dict.language.en': {
    id: 'Bahasa Inggris',
    en: 'English'
  },
  'dict.language.desc': {
    id: 'Pilih bahasa kamus yang digunakan saat bermain',
    en: 'Choose the dictionary language for gameplay'
  },

  'dict.search': {
    id: 'Cari Kata',
    en: 'Search Word'
  },
  'dict.searchPlaceholder': {
    id: 'Cari kata...',
    en: 'Search word...'
  },
  'dict.filterCategory': {
    id: 'Filter Kategori',
    en: 'Filter Category'
  },
  'dict.allCategories': {
    id: 'Semua Kategori',
    en: 'All Categories'
  },
  'dict.sort': {
    id: 'Urutkan',
    en: 'Sort'
  },
  'dict.sortAZ': {
    id: 'Kata (A-Z)',
    en: 'Word (A-Z)'
  },
  'dict.sortZA': {
    id: 'Kata (Z-A)',
    en: 'Word (Z-A)'
  },
  'dict.sortNewest': {
    id: 'Terbaru',
    en: 'Newest'
  },
  'dict.sortOldest': {
    id: 'Terlama',
    en: 'Oldest'
  },
  
  // Import/Export
  'import.title': {
    id: 'Import/Export Dictionary',
    en: 'Import/Export Dictionary'
  },
  'import.showDocs': {
    id: 'Lihat Dokumentasi',
    en: 'View Documentation'
  },
  'import.hideDocs': {
    id: 'Sembunyikan',
    en: 'Hide'
  },
  'import.fromJSON': {
    id: 'Import dari JSON',
    en: 'Import from JSON'
  },
  'import.uploadDesc': {
    id: 'Upload file JSON untuk menambah kata',
    en: 'Upload JSON file to add words'
  },
  'import.selectFile': {
    id: 'Pilih File JSON',
    en: 'Select JSON File'
  },
  'import.toJSON': {
    id: 'Export ke JSON',
    en: 'Export to JSON'
  },
  'import.downloadDesc': {
    id: 'Download semua kata dalam format JSON',
    en: 'Download all words in JSON format'
  },
  'import.download': {
    id: 'Download Dictionary',
    en: 'Download Dictionary'
  },
  'import.fileContains': {
    id: 'File akan berisi',
    en: 'File will contain'
  },
  'import.words': {
    id: 'kata',
    en: 'words'
  },
  'import.success': {
    id: 'Import berhasil!',
    en: 'Import successful!'
  },
  'import.failed': {
    id: 'Import gagal!',
    en: 'Import failed!'
  },
  
  // Table
  'table.no': {
    id: 'No',
    en: 'No'
  },
  'table.word': {
    id: 'Kata',
    en: 'Word'
  },
  'table.category': {
    id: 'Kategori',
    en: 'Category'
  },
  'table.dateAdded': {
    id: 'Tanggal Ditambahkan',
    en: 'Date Added'
  },
  'table.actions': {
    id: 'Aksi',
    en: 'Actions'
  },
  'table.showing': {
    id: 'Menampilkan',
    en: 'Showing'
  },
  'table.of': {
    id: 'dari',
    en: 'of'
  },
  
  // Buttons
  'btn.cancel': {
    id: 'Batal',
    en: 'Cancel'
  },
  'btn.delete': {
    id: 'Hapus',
    en: 'Delete'
  },
  'btn.edit': {
    id: 'Edit',
    en: 'Edit'
  },
  'btn.save': {
    id: 'Simpan',
    en: 'Save'
  },
  
  // Confirmations
  'confirm.quit': {
    id: 'Apakah Anda yakin ingin keluar dari permainan?',
    en: 'Are you sure you want to quit the game?'
  },
  'confirm.logout': {
    id: 'Apakah Anda yakin ingin logout?',
    en: 'Are you sure you want to logout?'
  },
  'confirm.delete': {
    id: 'Apakah Anda yakin ingin menghapus kata',
    en: 'Are you sure you want to delete word'
  },
  
  // Language
  'language.id': {
    id: 'Bahasa Indonesia',
    en: 'Indonesian'
  },
  'language.en': {
    id: 'Bahasa Inggris',
    en: 'English'
  }
}

export const useLanguage = () => {
  const currentLanguage = useState<Language>('language', () => 'id')

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    return translation[currentLanguage.value]
  }

  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
  }

  const toggleLanguage = () => {
    currentLanguage.value = currentLanguage.value === 'id' ? 'en' : 'id'
  }

  return {
    currentLanguage,
    t,
    setLanguage,
    toggleLanguage
  }
}
