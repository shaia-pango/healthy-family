import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useFamilyStore } from './store/familyStore';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { LogMeal } from './pages/LogMeal';
import { Pet } from './pages/Pet';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import { isSupabaseConfigured } from './lib/supabase';
import './App.css';

function App() {
  const init = useFamilyStore((s) => s.init);
  const familyCode = useFamilyStore((s) => s.familyCode);
  const loading = useFamilyStore((s) => s.loading);

  useEffect(() => {
    init();
  }, [init]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-3">⚙️</div>
          <h1 className="text-2xl font-black text-brand-700 mb-3">חסרה הגדרת Supabase</h1>
          <p className="text-gray-700 mb-4 leading-relaxed">
            צריך ליצור קובץ <code className="bg-gray-100 px-1 rounded">.env.local</code> בשורש הפרויקט עם המשתנים:
          </p>
          <pre className="text-start bg-gray-900 text-emerald-300 p-4 rounded-xl text-xs mb-4 overflow-auto">
{`VITE_SUPABASE_URL=https://YOUR.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY`}
          </pre>
          <p className="text-sm text-gray-500">
            ראו את <code>README.md</code> לפרטים מלאים על הקמת Supabase + Vercel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-2xl">⏳ טוען...</div>;
  }

  if (!familyCode) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/log" element={<LogMeal />} />
        <Route path="/pet/:memberId" element={<Pet />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
