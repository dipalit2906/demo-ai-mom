// App.jsx — Root component with tab routing, dark mode, and Toaster

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import PreferencesForm from './components/PreferencesForm'
import MealGenerator from './components/MealGenerator'
import MealHistory from './components/MealHistory'

export default function App() {
  const [activeTab, setActiveTab] = useState('planner')

  // Dark mode — persisted to localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('aime-dark-mode')
    if (saved !== null) return saved === 'true'
    // Default: always dark mode
    return true
  })

  // Apply/remove 'dark' class on <html> when darkMode changes
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('aime-dark-mode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  // After preferences are saved, auto-switch to meal generator
  const handlePreferencesSaved = () => {
    setTimeout(() => setActiveTab('generator'), 800)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            style: { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' },
          },
          error: {
            style: { background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3' },
          },
        }}
      />

      {/* Sticky navigation bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main content */}
      <main className="px-4 sm:px-6 py-8 pb-16">
        {activeTab === 'planner' && (
          <PreferencesForm onSaved={handlePreferencesSaved} />
        )}
        {activeTab === 'generator' && (
          <MealGenerator />
        )}
        {activeTab === 'history' && (
          <MealHistory />
        )}
      </main>

      {/* Bottom tab bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-rose-100 dark:border-gray-700 z-50">
        <div className="flex">
          {[
            { id: 'planner', emoji: '👨‍👩‍👧', label: 'Family' },
            { id: 'generator', emoji: '✨', label: 'Generate' },
            { id: 'history', emoji: '📋', label: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-rose-500'
                  : 'text-gray-400 dark:text-gray-500'
                }`}
            >
              <span className="text-xl mb-0.5">{tab.emoji}</span>
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-rose-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
