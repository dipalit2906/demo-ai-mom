// AimeSummary — personalized summary card showing what Aime knows about the family
// Props:
//   preferences: object from Supabase family_preferences table (or null)

export default function AimeSummary({ preferences }) {
  if (!preferences) {
    return (
      <div className="bg-gradient-to-r from-rose-50 to-lavender-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30 animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-500 mb-1">Hi, I'm Aime! 👋</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Fill out your family preferences and I'll create personalized meal plans just for you!
            </p>
          </div>
        </div>
      </div>
    )
  }

  const {
    mom_name,
    kids_count,
    food_preference,
    allergies,
    cooking_time,
    budget_preference,
  } = preferences

  // Build a friendly natural-language summary
  const timeLabel = { under_15: 'quick', under_30: '30-minute', flexible: 'flexible' }[cooking_time] || cooking_time
  const budgetLabel = { budget: 'budget-friendly', moderate: 'moderate', premium: 'premium' }[budget_preference] || budget_preference
  const hasAllergies = allergies && allergies.trim().length > 0

  return (
    <div className="bg-gradient-to-r from-rose-50 to-lavender-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30 animate-slideUp">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-rose-500 mb-1">Aime Summary ✨</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Aime knows that{' '}
            <span className="font-semibold text-rose-500">{mom_name}</span>'s family of{' '}
            <span className="font-semibold">{kids_count} kid{kids_count !== 1 ? 's' : ''}</span> prefers{' '}
            <span className="font-semibold text-rose-400">{food_preference}</span> meals,{' '}
            <span className="font-semibold">{timeLabel} recipes</span>, and{' '}
            <span className="font-semibold">{budgetLabel}</span> planning.
            {hasAllergies && (
              <>
                {' '}Avoiding: <span className="font-semibold text-amber-500">{allergies}</span>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
