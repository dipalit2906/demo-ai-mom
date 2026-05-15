// Navbar — responsive header with logo, tab navigation, and dark mode toggle
// Props:
//   activeTab: 'planner' | 'generator' | 'history'
//   setActiveTab: function
//   darkMode: boolean
//   toggleDarkMode: function

import { useState } from 'react'

export default function Navbar({ activeTab, setActiveTab, darkMode, toggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const tabs = [
    { id: 'planner', label: '👨‍👩‍👧 My Family', emoji: '👨‍👩‍👧' },
    { id: 'generator', label: '✨ Meal Generator', emoji: '✨' },
    { id: 'history', label: '📋 History', emoji: '📋' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-rose-100 dark:border-gray-700 shadow-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center shadow-soft">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <div>
              <span className="text-rose-500 font-bold text-lg leading-none block">Aime</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs leading-none">Meal Planner</span>
            </div>
          </div>

          {/* Desktop tabs */}
          <div className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-gray-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right side: dark mode + mobile menu */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden pb-3 space-y-1 animate-fadeIn">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                onClick={() => { setActiveTab(tab.id); setMenuOpen(false) }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-rose-50/50 dark:hover:bg-gray-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
