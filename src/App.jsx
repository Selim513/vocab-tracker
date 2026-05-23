import { useState, useEffect, useMemo, useCallback } from 'react'
import WordForm from './components/WordForm'
import SearchBar from './components/SearchBar'
import WordList from './components/WordList'
import ThemeToggle from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingWord, setEditingWord] = useState(null)
  const { theme, toggle: toggleTheme } = useTheme()

  const fetchWords = useCallback(async () => {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setWords(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchWords() }, [fetchWords])

  const filteredWords = useMemo(() => {
    if (!search.trim()) return words
    const q = search.toLowerCase()
    return words.filter(
      w => w.english_word.toLowerCase().includes(q) || w.arabic_translation.includes(q)
    )
  }, [words, search])

  const handleAdd = async (word) => {
    const { data, error } = await supabase
      .from('words')
      .insert({
        english_word: word.english,
        arabic_translation: word.arabic,
        notes: word.notes || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { duplicate: true, word: word.english }
      }
      return { error: error.message }
    }

    setWords(prev => [data, ...prev])
    return { success: true }
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('words').delete().eq('id', id)
    if (!error) setWords(prev => prev.filter(w => w.id !== id))
  }

  const handleEdit = async (id, updates) => {
    const { data, error } = await supabase
      .from('words')
      .update({
        english_word: updates.english,
        arabic_translation: updates.arabic,
        notes: updates.notes || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { duplicate: true, word: updates.english }
      }
      return { error: error.message }
    }

    setWords(prev => prev.map(w => w.id === id ? data : w))
    setEditingWord(null)
    return { success: true }
  }

  const handleStartEdit = (word) => {
    setEditingWord(word)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingWord(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="mb-8 text-center relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Vocab Tracker
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Build your personal English-Arabic vocabulary
          </p>
        </header>

        <div className="space-y-6">
          <WordForm onAdd={handleAdd} onEdit={handleEdit} editingWord={editingWord} onCancelEdit={handleCancelEdit} existingWords={words} />

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <span className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {loading ? '...' : `${filteredWords.length} ${filteredWords.length === 1 ? 'word' : 'words'}`}
            </span>
          </div>

          <WordList words={filteredWords} onDelete={handleDelete} onEdit={handleStartEdit} loading={loading} />
        </div>
      </div>
    </div>
  )
}
