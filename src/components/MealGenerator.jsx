// Screen 2 — AI Meal Generator
// Fetches family preferences, builds AI prompt, calls OpenAI, saves to history

import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { buildPrompt, generateMealPlan } from '../services/openaiService'
import AimeSummary from './AimeSummary'
import QuickChips from './QuickChips'
import MealCard from './MealCard'
import LoadingSkeleton from './LoadingSkeleton'
import toast from 'react-hot-toast'

export default function MealGenerator() {
  const [preferences, setPreferences] = useState(null)
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [activePreset, setActivePreset] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [promptPreview, setPromptPreview] = useState(null)
  const [mealPlan, setMealPlan] = useState(null)
  const [error, setError] = useState(null)

  // Load latest preferences when component mounts
  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    setLoadingPrefs(true)
    try {
      const { data, error } = await supabase
        .from('family_preferences')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
      setPreferences(data || null)
    } catch (err) {
      console.error(err)
      // Don't block the UI — preferences just won't show
    } finally {
      setLoadingPrefs(false)
    }
  }

  const handleGenerate = async (isRegenerate = false) => {
    if (!preferences) {
      toast.error('Please fill out your family preferences first! 👨‍👩‍👧')
      return
    }

    setError(null)
    if (isRegenerate) {
      setRegenerating(true)
    } else {
      setGenerating(true)
      setMealPlan(null)
    }

    try {
      // Build the optimized prompt
      const prompt = buildPrompt(preferences, activePreset)
      setPromptPreview(prompt)

      // Call OpenAI
      const result = await generateMealPlan(prompt)
      setMealPlan(result)

      // Save to Supabase meal_history
      const { error: saveError } = await supabase
        .from('meal_history')
        .insert([{
          generated_meal_plan: result,
          prompt_used: prompt,
        }])

      if (saveError) {
        console.warn('Could not save to history:', saveError)
        // Non-fatal — don't block the user
      }

      toast.success('Meal plan generated! 🎉')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong. Please try again.')
      toast.error(err.message || 'Could not generate meal plan.')
    } finally {
      setGenerating(false)
      setRegenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slideUp">

      {/* Page header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-400 to-lavender-500 shadow-soft mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Meal Generator</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Personalized weekly plans in seconds
        </p>
      </div>

      {/* Aime Summary card */}
      {loadingPrefs ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-card">
          <LoadingSkeleton lines={2} />
        </div>
      ) : (
        <AimeSummary preferences={preferences} />
      )}

      {/* Quick preset chips */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-card border border-gray-50 dark:border-gray-700">
        <QuickChips activePreset={activePreset} onSelect={setActivePreset} />
      </div>

      {/* Prompt preview */}
      {promptPreview && (
        <div className="bg-lavender-50 dark:bg-purple-900/20 rounded-2xl p-5 border border-lavender-200 dark:border-purple-900/30 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-lavender-500">🔍 Prompt sent to AI</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
            "{promptPreview}"
          </p>
        </div>
      )}

      {/* Generate button */}
      {!mealPlan && (
        <button
          id="generate-meal-plan"
          onClick={() => handleGenerate(false)}
          disabled={generating || loadingPrefs}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-500 to-lavender-500 text-white font-bold text-base shadow-soft hover:shadow-hover disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Aime is planning your week...
            </>
          ) : (
            <>
              ✨ Generate Weekly Meal Plan
            </>
          )}
        </button>
      )}

      {/* Loading skeleton while generating */}
      {generating && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card">
          <p className="text-sm text-rose-400 font-medium mb-4 animate-pulse">
            🤖 Aime is crafting your personalized meal plan...
          </p>
          <LoadingSkeleton type="card" />
        </div>
      )}

      {/* Error state */}
      {error && !generating && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-900/30 animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="text-xl">😔</span>
            <div>
              <p className="text-sm font-semibold text-red-500 mb-1">Oops, something went wrong!</p>
              <p className="text-xs text-red-400">{error}</p>
              <button
                onClick={() => handleGenerate(false)}
                className="mt-3 text-xs font-medium text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated meal plan card */}
      {mealPlan && !generating && (
        <>
          <MealCard
            mealPlan={mealPlan}
            onRegenerate={() => handleGenerate(true)}
            isRegenerating={regenerating}
          />
          {/* Generate again button (below card) */}
          <button
            id="generate-new-plan"
            onClick={() => { setMealPlan(null); setPromptPreview(null) }}
            className="w-full py-3 rounded-xl border-2 border-rose-200 dark:border-rose-900/50 text-rose-400 text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
          >
            ← Start a new plan
          </button>
        </>
      )}

      {/* No preferences empty state */}
      {!loadingPrefs && !preferences && (
        <div className="text-center py-8">
          <span className="text-5xl block mb-3">👨‍👩‍👧</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Set up your family preferences first to get a personalized meal plan!
          </p>
        </div>
      )}

    </div>
  )
}
