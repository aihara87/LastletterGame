import type { Word } from '~/composables/useDictionary'

export class BotPlayer {
  private dictionary: Word[]
  private usedWords: Set<string>
  private difficulty: 'easy' | 'medium' | 'hard'

  constructor(dictionary: Word[], usedWords: Set<string>, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.dictionary = dictionary
    this.usedWords = usedWords
    this.difficulty = difficulty
  }

  findWord(requiredFirstLetter: string): string | null {
    const availableWords = this.dictionary
      .filter(w => 
        w.word.toLowerCase().startsWith(requiredFirstLetter.toLowerCase()) &&
        !this.usedWords.has(w.word.toLowerCase())
      )
      .map(w => w.word)

    if (availableWords.length === 0) {
      return null
    }

    // Difficulty-based selection
    switch (this.difficulty) {
      case 'easy':
        // Easy: pick random word
        return this.pickRandom(availableWords)
      
      case 'medium':
        // Medium: prefer words that leave more options for opponent
        return this.pickStrategic(availableWords)
      
      case 'hard':
        // Hard: pick words that minimize opponent's options
        return this.pickDifficult(availableWords)
      
      default:
        return this.pickRandom(availableWords)
    }
  }

  private pickRandom(words: string[]): string {
    return words[Math.floor(Math.random() * words.length)]
  }

  private pickStrategic(words: string[]): string {
    // Pick word whose last letter has moderate number of options
    const scoredWords = words.map(word => {
      const lastLetter = word.charAt(word.length - 1)
      const nextOptions = this.dictionary.filter(w => 
        w.word.toLowerCase().startsWith(lastLetter.toLowerCase()) &&
        !this.usedWords.has(w.word.toLowerCase())
      ).length
      
      return { word, score: nextOptions }
    })

    // Sort by score and pick from middle range
    scoredWords.sort((a, b) => b.score - a.score)
    const midIndex = Math.floor(scoredWords.length / 2)
    const range = Math.floor(scoredWords.length / 4) || 1
    const start = Math.max(0, midIndex - range)
    const end = Math.min(scoredWords.length, midIndex + range)
    
    const midRangeWords = scoredWords.slice(start, end)
    return this.pickRandom(midRangeWords.map(w => w.word))
  }

  private pickDifficult(words: string[]): string {
    // Pick word whose last letter has fewest options
    const scoredWords = words.map(word => {
      const lastLetter = word.charAt(word.length - 1)
      const nextOptions = this.dictionary.filter(w => 
        w.word.toLowerCase().startsWith(lastLetter.toLowerCase()) &&
        !this.usedWords.has(w.word.toLowerCase())
      ).length
      
      return { word, score: nextOptions }
    })

    // Sort by score (ascending) and pick from lowest
    scoredWords.sort((a, b) => a.score - b.score)
    
    // Pick from top 3 hardest words
    const hardestWords = scoredWords.slice(0, Math.min(3, scoredWords.length))
    return this.pickRandom(hardestWords.map(w => w.word))
  }

  // Simulate thinking time
  async makeMove(requiredFirstLetter: string, thinkingTime: number = 1000): Promise<string | null> {
    await new Promise(resolve => setTimeout(resolve, thinkingTime))
    return this.findWord(requiredFirstLetter)
  }
}
