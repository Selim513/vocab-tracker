import { useState } from 'react'

const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/
const LATIN_RE = /[A-Za-z]/

function hasArabic(text) {
  return ARABIC_RE.test(text)
}

function hasLatin(text) {
  return LATIN_RE.test(text)
}

export default function WordForm({ onAdd, existingWords }) {
  const [english, setEnglish] = useState('')
  const [arabic, setArabic] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ english: '', arabic: '' })

  const handleEnglishChange = (value) => {
    setEnglish(value)
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

    if (existingWords.some(w => w.english_word.toLowerCase() === trimmedEnglish.toLowerCase())) {
      setError(`"${trimmedEnglish}" already exists in your vocabulary.`)
      return
    }

    setSubmitting(true)
    const result = await onAdd({ english: trimmedEnglish, arabic: trimmedArabic, notes: notes.trim() })
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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Add New Word</h2>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="english" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            English Word *
          </label>
          <input
            id="english"
            type="text"
            value={english}
            onChange={e => handleEnglishChange(e.target.value)}
            placeholder="e.g. serendipity"
            disabled={submitting}
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
          <label htmlFor="arabic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Arabic Translation *
          </label>
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
        {submitting ? 'Adding...' : 'Add Word'}
      </button>
    </form>
  )
}
