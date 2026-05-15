// Screen 1 — Family Preferences Form
// Collects family info and saves to Supabase family_preferences table

import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import toast from 'react-hot-toast'

// Reusable radio card sub-component
function RadioCard({ id, name, value, label, emoji, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${checked
          ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
          : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-rose-200 dark:hover:border-rose-800'
        }`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-2xl">{emoji}</span>
      <span className={`text-sm font-medium ${checked ? 'text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-300'}`}>
        {label}
      </span>
      {checked && (
        <span className="ml-auto w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs">✓</span>
        </span>
      )}
    </label>
  )
}

// Field section wrapper
function FormSection({ title, emoji, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>
      {children}
    </div>
  )
}

export default function PreferencesForm({ onSaved }) {
  const [form, setForm] = useState({
    mom_name: '',
    kids_count: 1,
    food_preference: 'non-vegetarian',
    allergies: '',
    cooking_time: 'under_30',
    budget_preference: 'moderate',
  })
  const [saving, setSaving] = useState(false)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.mom_name.trim()) {
      toast.error('Please enter your name! 😊')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('family_preferences')
        .insert([{
          mom_name: form.mom_name.trim(),
          kids_count: Number(form.kids_count),
          food_preference: form.food_preference,
          allergies: form.allergies.trim() || null,
          cooking_time: form.cooking_time,
          budget_preference: form.budget_preference,
        }])
        .select() // Return the inserted row so we get its ID

      if (error) throw error

      // Save this specific preference ID to the browser so the user only sees their own data
      if (data && data[0]) {
        localStorage.setItem('aime-preference-id', data[0].id)
      }

      toast.success(`Welcome, ${form.mom_name}! Your preferences are saved 🎉`)
      onSaved?.(form) // notify parent to refresh preferences
    } catch (err) {
      console.error(err)
      toast.error('Could not save preferences. Check your Supabase connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-slideUp">
      {/* Page header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-500 shadow-soft mb-4">
          <span className="text-3xl">👨‍👩‍👧</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tell Aime About Your Family</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Your personalized meal plans start here
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Mom Name */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-50 dark:border-gray-700">
          <FormSection title="What's your name?" emoji="👩">
            <input
              id="mom-name"
              type="text"
              placeholder="e.g. Sarah"
              value={form.mom_name}
              onChange={(e) => set('mom_name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all text-sm"
            />
          </FormSection>
        </div>

        {/* Kids Count */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-50 dark:border-gray-700">
          <FormSection title="How many kids?" emoji="🧒">
            <div className="flex items-center gap-4">
              <button
                type="button"
                id="kids-minus"
                onClick={() => set('kids_count', Math.max(1, form.kids_count - 1))}
                className="w-12 h-12 rounded-xl border-2 border-rose-200 text-rose-500 font-bold text-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                −
              </button>
              <span className="text-3xl font-bold text-gray-800 dark:text-white w-10 text-center">
                {form.kids_count}
              </span>
              <button
                type="button"
                id="kids-plus"
                onClick={() => set('kids_count', Math.min(10, form.kids_count + 1))}
                className="w-12 h-12 rounded-xl border-2 border-rose-200 text-rose-500 font-bold text-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-gray-400">kid{form.kids_count !== 1 ? 's' : ''}</span>
            </div>
          </FormSection>
        </div>

        {/* Food Preference */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-50 dark:border-gray-700">
          <FormSection title="Food preference" emoji="🥗">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioCard id="food-veg" name="food_preference" value="vegetarian" label="Vegetarian" emoji="🥦" checked={form.food_preference === 'vegetarian'} onChange={(e) => set('food_preference', e.target.value)} />
              <RadioCard id="food-vegan" name="food_preference" value="vegan" label="Vegan" emoji="🌱" checked={form.food_preference === 'vegan'} onChange={(e) => set('food_preference', e.target.value)} />
              <RadioCard id="food-nonveg" name="food_preference" value="non-vegetarian" label="Non-Vegetarian" emoji="🍗" checked={form.food_preference === 'non-vegetarian'} onChange={(e) => set('food_preference', e.target.value)} />
            </div>
          </FormSection>
        </div>

        {/* Allergies */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-50 dark:border-gray-700">
          <FormSection title="Any allergies or restrictions?" emoji="⚠️">
            <input
              id="allergies"
              type="text"
              placeholder="e.g. peanuts, gluten, dairy (leave blank if none)"
              value={form.allergies}
              onChange={(e) => set('allergies', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all text-sm"
            />
          </FormSection>
        </div>

        {/* Cooking Time */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-50 dark:border-gray-700">
          <FormSection title="How much time do you have to cook?" emoji="⏱️">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioCard id="time-15" name="cooking_time" value="under_15" label="Under 15 mins" emoji="⚡" checked={form.cooking_time === 'under_15'} onChange={(e) => set('cooking_time', e.target.value)} />
              <RadioCard id="time-30" name="cooking_time" value="under_30" label="Under 30 mins" emoji="🕐" checked={form.cooking_time === 'under_30'} onChange={(e) => set('cooking_time', e.target.value)} />
              <RadioCard id="time-flex" name="cooking_time" value="flexible" label="Flexible" emoji="😌" checked={form.cooking_time === 'flexible'} onChange={(e) => set('cooking_time', e.target.value)} />
            </div>
          </FormSection>
        </div>

        {/* Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-50 dark:border-gray-700">
          <FormSection title="What's your budget?" emoji="💰">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioCard id="budget-friendly" name="budget_preference" value="budget" label="Budget Friendly" emoji="🏷️" checked={form.budget_preference === 'budget'} onChange={(e) => set('budget_preference', e.target.value)} />
              <RadioCard id="budget-moderate" name="budget_preference" value="moderate" label="Moderate" emoji="💳" checked={form.budget_preference === 'moderate'} onChange={(e) => set('budget_preference', e.target.value)} />
              <RadioCard id="budget-premium" name="budget_preference" value="premium" label="Premium" emoji="✨" checked={form.budget_preference === 'premium'} onChange={(e) => set('budget_preference', e.target.value)} />
            </div>
          </FormSection>
        </div>

        {/* Submit button */}
        <button
          id="save-preferences"
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-white font-semibold text-base shadow-soft hover:shadow-hover hover:from-rose-600 hover:to-rose-500 disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-3"
        >
          {saving ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving your preferences...
            </>
          ) : (
            <>
              💾 Save My Preferences
            </>
          )}
        </button>

      </form>
    </div>
  )
}
