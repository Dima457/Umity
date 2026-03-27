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
    <header className="bg-[#2D2D2D] text-white p-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-[#D85D3F] to-[#E87A5F] bg-clip-text text-transparent hover:from-[#E87A5F] hover:to-[#D85D3F] transition-all duration-300">
            Umity
          </Link>

          <nav className="flex flex-wrap gap-4 md:gap-6">
            {navItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded transition-colors ${
                  currentPath === item.href 
                    ? 'bg-[#D85D3F] text-white' 
                    : 'text-[#B0B0B0] hover:bg-[#3D3D3D] hover:text-white'
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

