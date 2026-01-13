export interface Word {
  id: string
  word: string
  category?: string
  createdAt: Date
  language?: 'id' | 'en'
}

export const useDictionary = () => {
  const dictionary = useState<Word[]>('dictionary', () => [])
  const dictionaryLanguage = useState<'id' | 'en'>('dictionaryLanguage', () => 'id')

  // Fetch words from API
  const refreshDictionary = async () => {
    try {
      const data = await $fetch<Word[]>('/api/dictionary')
      if (data) {
        // Ensure dates are objects if JSON returned strings
        dictionary.value = data.map(w => ({
          ...w,
          createdAt: new Date(w.createdAt)
        }))
      }
    } catch (e) {
      console.error('Failed to fetch dictionary', e)
    }
  }

  // Get words by selected dictionary language
  const currentDictionary = computed(() => 
    dictionary.value.filter(w => w.language === dictionaryLanguage.value)
  )

  const addWord = async (word: string, category?: string, language?: 'id' | 'en') => {
    const lang = language || dictionaryLanguage.value
    try {
      const newWord = await $fetch<Word>('/api/dictionary', {
        method: 'POST',
        body: { word, category, language: lang }
      })
      
      // Update local state
      dictionary.value.push({
        ...newWord,
        createdAt: new Date(newWord.createdAt)
      })
    } catch (e) {
      console.error('Add word failed', e)
    }
  }

  const setDictionaryLanguage = (lang: 'id' | 'en') => {
    dictionaryLanguage.value = lang
  }

  const getDictionaryLanguage = computed(() => dictionaryLanguage.value)

  const removeWord = async (id: string) => {
    try {
      await $fetch(`/api/dictionary/${id}`, { method: 'DELETE' })
      dictionary.value = dictionary.value.filter(w => w.id !== id)
    } catch (e) {
      console.error('Remove word failed', e)
    }
  }

  const updateWord = async (id: string, word: string, category?: string, language?: 'id' | 'en') => {
    try {
      const lang = language || dictionary.value.find(w => w.id === id)?.language
      await $fetch(`/api/dictionary/${id}`, {
        method: 'PUT',
        body: { word, category, language: lang }
      })
      
      const index = dictionary.value.findIndex(w => w.id === id)
      if (index !== -1) {
        dictionary.value[index] = {
          ...dictionary.value[index],
          word: word.toLowerCase(),
          category,
          language: lang
        }
      }
    } catch (e) {
      console.error('Update word failed', e)
    }
  }

  const isValidWord = (word: string): boolean => {
    return currentDictionary.value.some(w => w.word.toLowerCase() === word.toLowerCase())
  }

  const getWordsByFirstLetter = (letter: string): Word[] => {
    return currentDictionary.value.filter(w => 
      w.word.toLowerCase().startsWith(letter.toLowerCase())
    )
  }

  const importWords = async (words: Array<{ word: string, category?: string, language?: 'id' | 'en' }>) => {
    try {
      // Prepare for bulk import API
      const result = await $fetch<{ imported: number, skipped: number, total: number }>('/api/dictionary/import', {
        method: 'POST',
        body: words.map(w => ({
          ...w,
          language: w.language || dictionaryLanguage.value
        }))
      })
      
      // Refresh dictionary to get new IDs and data
      await refreshDictionary()
      
      return result
    } catch (e) {
      console.error('Import failed', e)
      throw e
    }
  }

  const clearAllWords = async () => {
    // Implement delete all endpoint if needed, or just clear local for now? 
    // Wait, user requested clearAllWords in previous code.
    // I should create DELETE /api/dictionary to clear all? 
    // Dangerous. Let's keep it but maybe it only cleared state before.
    // If it's admin feature, it should clear DB.
    // For now, I'll just clear local state to match signature or implement loop.
    // Actually, let's implement a clear-all endpoint if necessary, but for safety I'll skip implementation or just warn.
    // The previous implementation just cleared local state.
    dictionary.value = []
  }

  return {
    dictionary,
    currentDictionary,
    dictionaryLanguage,
    getDictionaryLanguage,
    setDictionaryLanguage,
    addWord,
    removeWord,
    updateWord,
    isValidWord,
    getWordsByFirstLetter,
    importWords,
    clearAllWords,
    refreshDictionary
  }
}
