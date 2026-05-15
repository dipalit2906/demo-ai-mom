import { GoogleGenAI } from '@google/genai'

// Google Gemini client using the new @google/genai SDK
const apiKey = import.meta.env.VITE_GEMINI_API_KEY

// Initialize client only if key exists
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

/**
 * Builds a natural-language prompt from the user's saved preferences.
 * @param {Object} prefs - The family_preferences row from Supabase
 * @param {string} [preset] - Optional quick preset
 * @returns {string} The prompt string to send to Gemini
 */
export function buildPrompt(prefs, preset = null) {
  const {
    mom_name,
    kids_count,
    food_preference,
    allergies,
    cooking_time,
    budget_preference,
  } = prefs

  const timeMap = {
    under_15: 'under 15 minutes',
    under_30: 'under 30 minutes',
    flexible: 'with flexible cooking time',
  }
  const budgetMap = {
    budget: 'budget-friendly',
    moderate: 'moderately priced',
    premium: 'premium quality',
  }

  const timeLabel = timeMap[cooking_time] || cooking_time
  const budgetLabel = budgetMap[budget_preference] || budget_preference

  let base = `You are Aime, a friendly family meal planning assistant. Create a healthy 5-day family meal plan for ${mom_name}'s ${food_preference} family with ${kids_count} kid(s).`

  if (allergies && allergies.trim()) {
    base += ` Avoid: ${allergies}.`
  }

  base += ` Each meal should take ${timeLabel} and be ${budgetLabel}.`

  if (preset === 'quick') base += ' Focus on ultra-quick, no-fuss meals.'
  else if (preset === 'school_lunch') base += ' Include kid-friendly school lunch ideas.'
  else if (preset === 'healthy') base += ' Emphasize nutrition and balanced macros.'
  else if (preset === 'budget') base += ' Prioritize very affordable pantry ingredients.'

  base += ' Format day-by-day with **Day Name** as bold headers, then Breakfast, Lunch, and Dinner on separate lines using emoji bullets. Keep it concise and practical.'

  return base
}

/**
 * Calls Gemini API and returns the generated meal plan text.
 * Uses gemini-2.0-flash-lite — free tier, fast responses.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function generateMealPlan(prompt) {
  // Demo mode — no API key configured
  if (!apiKey || !ai) {
    return getMockMealPlan()
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const text = response.text
    if (!text) throw new Error('Empty response from Gemini.')
    return text

  } catch (error) {
    console.error('Gemini API error:', error)

    const msg = error?.message || ''

    if (msg.includes('API_KEY_INVALID') || msg.includes('API key') || msg.includes('403')) {
      throw new Error('Invalid Gemini API key. Please check your .env file.')
    }
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Rate limit reached. Please wait a moment and try again.')
    }
    if (msg.includes('404') || msg.includes('NOT_FOUND')) {
      throw new Error('Gemini model not available for your API key. Check your Google AI Studio account.')
    }

    throw new Error('Unable to generate meal plan. Please try again.')
  }
}

/**
 * Sample meal plan shown when no API key is configured (demo mode).
 */
function getMockMealPlan() {
  return `🌟 **Your 5-Day Family Meal Plan**

**Monday**
- 🌅 Breakfast: Banana oat pancakes with fresh berries
- 🥗 Lunch: Veggie wraps with hummus and cucumber
- 🍽️ Dinner: Pasta primavera with garlic bread

**Tuesday**
- 🌅 Breakfast: Greek yogurt parfait with granola
- 🥗 Lunch: Grilled cheese & tomato soup
- 🍽️ Dinner: Vegetable stir-fry with jasmine rice

**Wednesday**
- 🌅 Breakfast: Whole grain toast with avocado & eggs
- 🥗 Lunch: Caprese salad with crusty bread
- 🍽️ Dinner: Black bean tacos with mango salsa

**Thursday**
- 🌅 Breakfast: Smoothie bowls with chia seeds
- 🥗 Lunch: Minestrone soup with crackers
- 🍽️ Dinner: Mushroom risotto

**Friday**
- 🌅 Breakfast: Fluffy French toast with maple syrup
- 🥗 Lunch: Rainbow grain bowls
- 🍽️ Dinner: Homemade pizza with fresh vegetables

*✨ Add your Gemini API key for personalized AI-generated plans!*`
}

/**
 * Returns the demo meal plan instantly — no API call.
 * Used by the "👀 See Demo Result" button in the UI.
 */
export function getDemoMealPlan() {
  return getMockMealPlan()
}
