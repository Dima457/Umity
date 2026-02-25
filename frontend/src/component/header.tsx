/// components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const currentPath = usePathname();//* хранит в себе текущий путь

  const navItems = [
    { name: 'Главная', href: '/' },
    { name: 'Поиск', href: '/search' },
    { name: 'Чат', href: '/chat' },
    { name: 'Профиль', href: '/profile' },
  ];

  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
            Umity
          </Link>

          <nav className="flex flex-wrap gap-4 md:gap-6">
            {navItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded ${
                  currentPath === item.href 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

