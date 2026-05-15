// Screen 3 — Meal History
// Shows all previously generated meal plans from Supabase meal_history table

import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import LoadingSkeleton from './LoadingSkeleton'

// Format a date string into a friendly label
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Truncate the meal plan text for the preview line
function truncate(text, maxLength = 120) {
  if (!text) return ''
  const cleaned = text.replace(/\*\*/g, '').replace(/^[#*\s]+/gm, '').trim()
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned
}

// Individual history card
function HistoryCard({ item, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-50 dark:border-gray-700 overflow-hidden animate-slideUp"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Card header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-lavender-100 dark:from-rose-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🍽️</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Weekly Meal Plan</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(item.created_at)}</p>
          </div>
        </div>
        <button
          id={`expand-history-${item.id}`}
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-rose-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          {expanded ? 'Collapse ↑' : 'View ↓'}
        </button>
      </div>

      {/* Preview (always visible) */}
      <div className="px-5 pb-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          {truncate(item.generated_meal_plan)}
        </p>
      </div>

      {/* Expanded full plan */}
      {expanded && (
        <div className="border-t border-gray-50 dark:border-gray-700 px-5 py-4 bg-gray-50/50 dark:bg-gray-900/20 animate-fadeIn">
          {/* Prompt used */}
          {item.prompt_used && (
            <div className="mb-4 p-3 bg-lavender-50 dark:bg-purple-900/20 rounded-xl border border-lavender-100 dark:border-purple-900/30">
              <p className="text-xs font-medium text-lavender-500 mb-1">🔍 Prompt used:</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{item.prompt_used}"</p>
            </div>
          )}
          {/* Full meal plan */}
          <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {item.generated_meal_plan}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MealHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('meal_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      console.error(err)
      setError('Could not load meal history. Check your Supabase connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-slideUp">

      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 shadow-soft mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meal History</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          All your previously generated plans
        </p>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-card">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center border border-red-200 dark:border-red-900/30">
          <span className="text-4xl block mb-3">😔</span>
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-4 text-sm font-medium text-red-500 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && history.length === 0 && (
        <div className="text-center py-16">
          <span className="text-6xl block mb-4">🍽️</span>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No meals planned yet</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Generate your first meal plan and it'll appear here!
          </p>
        </div>
      )}

      {/* History list */}
      {!loading && !error && history.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
            {history.length} plan{history.length !== 1 ? 's' : ''} generated
          </p>
          {history.map((item, index) => (
            <HistoryCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}

    </div>
  )
}
