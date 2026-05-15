// Screen 2 — AI Meal Generator
// Fetches family preferences, builds AI prompt, calls OpenAI, saves to history

import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { buildPrompt, generateMealPlan, getDemoMealPlan } from '../services/openaiService'
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
    const savedId = localStorage.getItem('aime-preference-id')
    
    // If they haven't saved preferences in this browser, don't fetch anything
    if (!savedId) {
      setPreferences(null)
      setLoadingPrefs(false)
      return
    }

    setLoadingPrefs(true)
    try {
      const { data, error } = await supabase
        .from('family_preferences')
        .select('*')
        .eq('id', savedId)
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
      const { data: saveResult, error: saveError } = await supabase
        .from('meal_history')
        .insert([{
          generated_meal_plan: result,
          prompt_used: prompt,
        }])
        .select() // Return the inserted row to get its ID

      if (saveError) {
        console.warn('Could not save to history:', saveError)
        // Non-fatal — don't block the user
      } else if (saveResult && saveResult[0]) {
        // Save history ID to local storage so user only sees their own history
        const existingHistory = JSON.parse(localStorage.getItem('aime-history-ids') || '[]')
        existingHistory.push(saveResult[0].id)
        localStorage.setItem('aime-history-ids', JSON.stringify(existingHistory))
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

      {/* Free API notice banner */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-4 py-3">
        <span className="text-lg flex-shrink-0 mt-0.5">⚡</span>
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">⚠️ Demo Notice — Free AI API</p>
          <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
            This demo uses Google Gemini's <strong>free tier</strong>, which may occasionally fail due to daily request limits.
            If it doesn't work, please wait 30–60 seconds and try again. <br />
            <strong>Once connected to a paid API key, this will work seamlessly every time. ✅</strong>
          </p>
        </div>
      </div>

      {/* Demo Result button */}
      <div className="relative group flex justify-center">
        <button
          id="see-demo-result"
          onClick={() => {
            setMealPlan(getDemoMealPlan())
            setPromptPreview('Create a healthy 5-day vegetarian family meal plan — demo result')
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-dashed border-rose-300 dark:border-rose-700 text-rose-500 dark:text-rose-400 text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-400 transition-all duration-200"
        >
          <span className="text-base">👀</span>
          See Demo Result
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-xl px-3 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg z-10">
          Want to see the full design &amp; output? Click here to load a sample meal plan instantly — no API needed! ✨
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
        </div>
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
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-900/30 animate-fadeIn space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">😔</span>
            <div>
              <p className="text-sm font-semibold text-red-500 mb-1">Oops, something went wrong!</p>
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              <button
                onClick={() => handleGenerate(false)}
                className="mt-3 text-xs font-medium text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
          {/* Free tier explanation */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 border border-amber-200 dark:border-amber-800/40">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Why did this happen?</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
              This app uses Google Gemini's <strong>free tier</strong>, which has a limited number of requests per day.
              The free API may occasionally be unavailable or throttled. Simply wait 30–60 seconds and try again.
              <br /><br />
              <span className="font-medium">For a live production app</span>, connecting a paid Gemini API key gives you full, uninterrupted access with higher limits.
            </p>
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
