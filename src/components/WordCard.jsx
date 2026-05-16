export default function WordCard({ word, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3 hover:shadow-md transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 capitalize truncate">{word.english_word}</h3>
          <p className="text-xl text-indigo-600 dark:text-indigo-400 mt-1" dir="rtl">{word.arabic_translation}</p>
        </div>
        <button
          onClick={() => onDelete(word.id)}
          className="shrink-0 p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition cursor-pointer"
          aria-label={`Delete ${word.english_word}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
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
