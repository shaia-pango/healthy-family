import { useFamilyStore } from '../store/familyStore';

export function Settings() {
  const { members, logs, familyCode, clearAllLogs, signOut } = useFamilyStore();

  const reset = async () => {
    if (!confirm('למחוק את כל ההיסטוריה של המשפחה? לא ניתן לשחזר.')) return;
    await clearAllLogs();
  };

  const exportJson = () => {
    const data = JSON.stringify({ members, logs }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthy-family-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 pt-6 pb-32 max-w-2xl mx-auto">
      <h2 className="text-2xl font-black mb-4">⚙️ הגדרות</h2>

      <div className="bg-white rounded-2xl p-4 mb-3 shadow">
        <div className="font-bold mb-2">המשפחה שלי</div>
        <div className="text-sm text-gray-600">קוד משפחתי: <span className="font-mono font-bold">{familyCode ?? '—'}</span></div>
        <div className="text-sm text-gray-600">בני משפחה: {members.length}</div>
        <div className="text-sm text-gray-600">תיעודי ארוחות: {logs.length}</div>
      </div>

      <button
        onClick={exportJson}
        className="w-full bg-white rounded-2xl p-4 mb-3 shadow text-start font-bold"
      >
        📤 ייצוא נתונים (JSON)
      </button>

      <button
        onClick={reset}
        className="w-full bg-rose-50 text-rose-700 rounded-2xl p-4 mb-3 shadow text-start font-bold border-2 border-rose-200"
      >
        🗑️ איפוס היסטוריית ארוחות
      </button>

      <button
        onClick={() => {
          if (confirm('להתנתק מהמשפחה? תצטרכו להזין את הקוד מחדש.')) signOut();
        }}
        className="w-full bg-white rounded-2xl p-4 shadow text-start font-bold"
      >
        🚪 התנתקות מהמכשיר הזה
      </button>

      <div className="mt-8 text-center text-xs text-gray-500">
        הנתונים מסונכרנים בין כל המכשירים של המשפחה דרך Supabase.
        <br />
        תמונות ארוחות נשמרות מקומית בלבד.
      </div>
    </div>
  );
}
