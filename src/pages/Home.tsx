import { Link } from 'react-router-dom';
import { useFamilyStore } from '../store/familyStore';
import { MemberCard } from '../components/MemberCard';

export function Home() {
  const { members, loading } = useFamilyStore();

  if (loading) {
    return <div className="p-8 text-center text-2xl">⏳ טוען...</div>;
  }

  return (
    <div className="px-4 pt-6 pb-40 max-w-2xl mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-black text-brand-700">המשפחה הבריאה 🌱</h1>
        <p className="text-gray-600 mt-1">בחרו מי אכל ומה אכל</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>

      <div className="fixed bottom-24 inset-x-0 mx-auto px-4 max-w-2xl flex justify-center gap-3">
        <Link
          to="/bonus"
          className="bg-amber-500 text-white font-black px-5 py-3 rounded-full shadow-2xl active:scale-95 transition no-tap-highlight"
        >
          🌟 פעולה
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
