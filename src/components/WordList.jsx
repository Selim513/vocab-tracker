import WordCard from './WordCard'

export default function WordList({ words, onDelete, onEdit, loading }) {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 dark:text-gray-500">Loading vocabulary...</p>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-400 dark:text-gray-500 text-lg">No words found.</p>
        <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Add your first vocabulary word above!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {words.map(word => (
        <WordCard key={word.id} word={word} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  )
}
