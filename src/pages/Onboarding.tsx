import { useState } from 'react';
import { useFamilyStore } from '../store/familyStore';

export function Onboarding() {
  const enterFamily = useFamilyStore((s) => s.enterFamily);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 3) {
      setError('קוד צריך להיות לפחות 3 תווים');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await enterFamily(trimmed);
      if (result.created) setCreated(trimmed);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'שגיאה';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 pb-32">
      <div className="w-full max-w-md text-center">
        <div className="text-7xl mb-3">🌱</div>
        <h1 className="text-3xl font-black text-brand-700 mb-2">המשפחה הבריאה</h1>
        <p className="text-gray-600 mb-8">
          הזינו את הקוד המשפחתי שלכם.
          <br />
          קוד חדש? פשוט תמציאו אחד — נוצר אוטומטית.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="AVIRAM"
          autoFocus
          autoCapitalize="characters"
          className="w-full text-center font-black text-2xl tracking-widest bg-white rounded-2xl py-5 shadow border-4 border-brand-200 focus:border-brand-500 outline-none"
        />

        {error && <div className="mt-4 text-rose-600 font-bold">{error}</div>}

        {created && (
          <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-700 font-bold">
            🎉 משפחה חדשה נוצרה עם הקוד <span className="font-mono">{created}</span>!
            <br />
            שתפו את הקוד עם שאר בני המשפחה.
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy || code.trim().length === 0}
          className="mt-6 w-full bg-brand-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg active:scale-95 disabled:opacity-40 transition"
        >
          {busy ? 'רגע...' : 'כניסה ←'}
        </button>

        <p className="mt-8 text-xs text-gray-500 leading-relaxed">
          הקוד המשפחתי הוא ה"מפתח" שלכם.
          <br />
          כל מי שמכיר אותו רואה את אותם נתונים.
          <br />
          אין הרשמה, אין סיסמאות, אין מעקב.
        </p>
      </div>
    </div>
  );
}
