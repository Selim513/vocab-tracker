import { useState, useEffect } from 'react'

const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/
const LATIN_RE = /[A-Za-z]/

function hasArabic(text) {
  return ARABIC_RE.test(text)
}

function hasLatin(text) {
  return LATIN_RE.test(text)
}

export default function WordForm({ onAdd, onEdit, editingWord, onCancelEdit, existingWords }) {
  const [english, setEnglish] = useState('')
  const [arabic, setArabic] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ english: '', arabic: '' })

  useEffect(() => {
    if (editingWord) {
      setEnglish(editingWord.english_word)
      setArabic(editingWord.arabic_translation)
      setNotes(editingWord.notes || '')
      setError('')
      setFieldErrors({ english: '', arabic: '' })
    }
  }, [editingWord])

  const handleAutoTranslate = async (direction) => {
    const isEnToAr = direction === 'en-ar'
    const source = isEnToAr ? english.trim() : arabic.trim()
    if (!source) return

    const langpair = isEnToAr ? 'en|ar' : 'ar|en'

    setTranslating(true)
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=${langpair}&de=devahmedshaabanselem@gmail.com`)
      const data = await res.json()

      if (data?.quotaFinished || data?.responseData?.translatedText?.includes('MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY')) {
        setError('Daily translation limit reached.')
        return
      }

      const translated = data?.responseData?.translatedText
      if (translated) {
        if (isEnToAr) {
          setArabic(translated)
          setFieldErrors(prev => ({ ...prev, arabic: '' }))
        } else {
          const capitalized = translated.charAt(0).toUpperCase() + translated.slice(1)
          setEnglish(capitalized)
          setFieldErrors(prev => ({ ...prev, english: '' }))
        }
      }
    } catch {
      // silently fail — user can type manually
    } finally {
      setTranslating(false)
    }
  }

  const handleEnglishChange = (value) => {
    const capitalized = value ? value.charAt(0).toUpperCase() + value.slice(1) : value
    setEnglish(capitalized)
    if (value.trim() && hasArabic(value)) {
      setFieldErrors(prev => ({ ...prev, english: 'Arabic characters are not allowed here.' }))
    } else {
      setFieldErrors(prev => ({ ...prev, english: '' }))
    }
  }

  const handleArabicChange = (value) => {
    setArabic(value)
    if (value.trim() && hasLatin(value)) {
      setFieldErrors(prev => ({ ...prev, arabic: 'English characters are not allowed here.' }))
    } else {
      setFieldErrors(prev => ({ ...prev, arabic: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedEnglish = english.trim()
    const trimmedArabic = arabic.trim()

    if (!trimmedEnglish || !trimmedArabic) {
      setError('English word and Arabic translation are required.')
      return
    }

    if (hasArabic(trimmedEnglish)) {
      setError('English field must contain only English characters.')
      return
    }

    if (hasLatin(trimmedArabic)) {
      setError('Arabic field must contain only Arabic characters.')
      return
    }

    const isEdit = !!editingWord

    if (!isEdit && existingWords.some(w => w.english_word.toLowerCase() === trimmedEnglish.toLowerCase())) {
      setError(`"${trimmedEnglish}" already exists in your vocabulary.`)
      return
    }

    if (isEdit && existingWords.some(w => w.english_word.toLowerCase() === trimmedEnglish.toLowerCase() && w.id !== editingWord.id)) {
      setError(`"${trimmedEnglish}" already exists in your vocabulary.`)
      return
    }

    setSubmitting(true)
    const result = isEdit
      ? await onEdit(editingWord.id, { english: trimmedEnglish, arabic: trimmedArabic, notes: notes.trim() })
      : await onAdd({ english: trimmedEnglish, arabic: trimmedArabic, notes: notes.trim() })
    setSubmitting(false)

    if (result?.duplicate) {
      setError(`"${result.word}" already exists in your vocabulary.`)
      return
    }
    if (result?.error) {
      setError(result.error)
      return
    }

    setEnglish('')
    setArabic('')
    setNotes('')
    setFieldErrors({ english: '', arabic: '' })
  }

  return (
    <form onSubmit={handleSubmit} className={`rounded-xl shadow-sm border p-6 transition-colors ${editingWord ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {editingWord ? 'Edit Word' : 'Add New Word'}
        </h2>
        {editingWord && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="english" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              English Word *
            </label>
            <button
              type="button"
              onClick={() => handleAutoTranslate('ar-en')}
              disabled={!arabic.trim() || translating || submitting}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {translating ? (
                <>
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Translating...
                </>
              ) : (
                <>Auto-Translate ✨</>
              )}
            </button>
          </div>
          <input
            id="english"
            type="text"
            value={english}
            onChange={e => handleEnglishChange(e.target.value)}
            placeholder="e.g. serendipity"
            disabled={submitting}
            style={{ textTransform: 'capitalize' }}
            className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 ${
              fieldErrors.english
                ? 'border-2 border-red-400 dark:border-red-500'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
          />
          {fieldErrors.english && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.english}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="arabic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Arabic Translation *
            </label>
            <button
              type="button"
              onClick={() => handleAutoTranslate('en-ar')}
              disabled={!english.trim() || translating || submitting}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {translating ? (
                <>
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Translating...
                </>
              ) : (
                <>Auto-Translate ✨</>
              )}
            </button>
          </div>
          <input
            id="arabic"
            type="text"
            value={arabic}
            onChange={e => handleArabicChange(e.target.value)}
            placeholder="مثال: مصادفة سعيدة"
            dir="rtl"
            disabled={submitting}
            className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 ${
              fieldErrors.arabic
                ? 'border-2 border-red-400 dark:border-red-500'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
          />
          {fieldErrors.arabic && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400" dir="rtl">{fieldErrors.arabic}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            Auto-translate is a helper — double-check translations for accuracy before saving.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes <span className="text-gray-400 dark:text-gray-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Usage example, context, memory aid..."
          rows={2}
          disabled={submitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (editingWord ? 'Saving...' : 'Adding...') : (editingWord ? 'Save Changes' : 'Add Word')}
      </button>
    </form>
  )
}
