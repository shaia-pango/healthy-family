import { Link } from 'react-router-dom';
import { useFamilyStore } from '../store/familyStore';
import { MemberCard } from '../components/MemberCard';

export function Home() {
  const { members, loading } = useFamilyStore();

  if (loading) {
    return <div className="p-8 text-center text-2xl">⏳ טוען...</div>;
  }

  return (
    <div className="px-4 pt-6 pb-48 max-w-2xl mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-black text-brand-700">המשפחה הבריאה 🌱</h1>
        <p className="text-gray-600 mt-1">בחרו מי אכל ומה אכל</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>

      <div
        className="fixed inset-x-0 mx-auto px-4 max-w-2xl flex justify-center items-center gap-3 z-30"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)' }}
      >
        <Link
          to="/bonus"
          aria-label="פעולה מיוחדת"
          className="bg-amber-500 text-white grid place-items-center w-16 h-16 rounded-full shadow-2xl active:scale-95 transition no-tap-highlight text-3xl"
        >
          🌟
        </Link>
        <Link
          to="/log"
          className="bg-brand-500 text-white text-xl font-black px-7 py-4 rounded-full shadow-2xl active:scale-95 transition no-tap-highlight"
        >
          🍽️ מה אכלתי?
        </Link>
      </div>
    </div>
  );
}
