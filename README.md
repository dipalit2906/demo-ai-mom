# 🍽️ Aime Meal Planner

> AI-powered weekly meal planning for busy moms — built with React, Supabase, and OpenAI.

---

## ✨ Features

- **Family Preferences Form** — One-time setup for dietary needs, allergies, cooking time, and budget
- **AI Meal Generator** — Generates a personalized 5-day meal plan using OpenAI
- **Quick Presets** — Quick Meals / School Lunch / Healthy Week / Budget Meals
- **Aime Summary** — Personalized card showing what Aime knows about your family
- **Meal History** — All past plans saved and accessible anytime
- **Dark Mode** — Toggle with OS preference detection
- **Mobile Responsive** — Mobile-first with bottom tab navigation

---

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Frontend framework + dev server |
| Tailwind CSS | Styling |
| Supabase | Database (family_preferences + meal_history) |
| OpenAI API | AI meal plan generation |
| react-hot-toast | Toast notifications |
| Netlify | Deployment |

---

## 🚀 Local Setup

### 1. Clone and install

```bash
cd ai-mom
npm install
```

### 2. Create your `.env` file

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and add:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OPENAI_API_KEY=sk-your-openai-key-here
```

> **Note:** Without an OpenAI key, the app runs in **demo mode** and returns a sample meal plan. All other features work normally.

### 3. Set up Supabase tables

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Run the SQL below:

```sql
-- Table 1: Family Preferences
CREATE TABLE family_preferences (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mom_name        text NOT NULL,
  kids_count      smallint NOT NULL DEFAULT 1,
  food_preference text NOT NULL DEFAULT 'non-vegetarian',
  allergies       text,
  cooking_time    text NOT NULL DEFAULT 'under_30',
  budget_preference text NOT NULL DEFAULT 'moderate',
  created_at      timestamptz DEFAULT now()
);

-- Table 2: Meal History
CREATE TABLE meal_history (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_meal_plan text NOT NULL,
  prompt_used         text,
  created_at          timestamptz DEFAULT now()
);

-- Enable Row Level Security (recommended)
ALTER TABLE family_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo (tighten for production)
CREATE POLICY "Allow public access" ON family_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON meal_history FOR ALL USING (true) WITH CHECK (true);
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🌐 Deploy to Netlify

### Option A — Netlify CLI

```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

### Option B — Netlify Dashboard (recommended)

1. Push your project to **GitHub**
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Select your repository
4. Netlify auto-detects `netlify.toml` — build settings are pre-configured
5. Click **Deploy site**

### Adding Environment Variables on Netlify

1. In your Netlify site: **Site Configuration → Environment Variables**
2. Click **Add a variable** for each:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key |

3. **Trigger a new deploy** after adding variables (Deploys → Trigger deploy)

---

## 📁 Project Structure

```
ai-mom/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Sticky nav + dark mode toggle
│   │   ├── PreferencesForm.jsx  # Screen 1: Family setup
│   │   ├── MealGenerator.jsx    # Screen 2: AI generation
│   │   ├── MealHistory.jsx      # Screen 3: Past plans
│   │   ├── AimeSummary.jsx      # Personalized summary card
│   │   ├── QuickChips.jsx       # Preset filter buttons
│   │   ├── MealCard.jsx         # Meal plan display + copy/regen
│   │   └── LoadingSkeleton.jsx  # Shimmer loading state
│   ├── services/
│   │   ├── supabaseClient.js    # Supabase singleton
│   │   └── openaiService.js     # Prompt builder + API call
│   ├── App.jsx                  # Root with tab routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind + global styles
├── public/favicon.svg
├── .env.example                 # Template (safe to commit)
├── .env                         # Your secrets (gitignored)
├── netlify.toml                 # Build + redirect config
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🔑 Where to Get Your Keys

| Service | URL |
|---|---|
| Supabase URL + Key | [supabase.com](https://supabase.com) → Project → Settings → API |
| OpenAI API Key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

---

## 💡 Demo Mode

If `VITE_OPENAI_API_KEY` is not set or is a placeholder, the app automatically uses **demo mode** and returns a sample 5-day meal plan. This is perfect for client demos without needing a paid API key.

---

## 🎨 Design System

- **Primary color**: Rose (`#f43f5e`)
- **Accent**: Lavender (`#a78bfa`)
- **Font**: Inter (Google Fonts)
- **Corners**: Rounded (`rounded-2xl`, `rounded-full`)
- **Theme**: Soft, clean, mobile-first
- **Dark mode**: `class` strategy, OS preference + toggle
# demo-ai-mom
