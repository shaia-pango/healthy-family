import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'בית', emoji: '🏠' },
  { to: '/log', label: 'אוכל', emoji: '🍽️' },
  { to: '/leaderboard', label: 'גביע', emoji: '🏆' },
  { to: '/settings', label: 'הגדרות', emoji: '⚙️' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-orange-100 safe-bottom z-50">
      <div className="max-w-2xl mx-auto grid grid-cols-4 px-2 pt-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 rounded-2xl no-tap-highlight transition ${
                isActive
                  ? 'text-brand-600 bg-brand-50 scale-105'
                  : 'text-gray-500 hover:bg-orange-50'
              }`
            }
          >
            <span className="text-3xl leading-none">{t.emoji}</span>
            <span className="text-xs font-bold">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
