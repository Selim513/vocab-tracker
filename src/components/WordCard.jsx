import { useState } from 'react'

export default function WordCard({ word, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 capitalize truncate">{word.english_word}</h3>
            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(word.english_word)
                utterance.lang = 'en-GB'
                window.speechSynthesis.cancel()
                window.speechSynthesis.speak(utterance)
              }}
              className="shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition cursor-pointer"
              aria-label={`Pronounce ${word.english_word}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 010 7.07" />
                <path d="M19.07 4.93a10 10 0 010 14.14" />
              </svg>
            </button>
          </div>
          <p className="text-xl text-indigo-600 dark:text-indigo-400 mt-1" dir="rtl">{word.arabic_translation}</p>
        </div>
        {confirming ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onDelete(word.id)}
              className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="shrink-0 p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition cursor-pointer"
            aria-label={`Delete ${word.english_word}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      {word.notes && (
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{word.notes}</p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        Added {new Date(word.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}
