"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-gray-700 bg-gray-900 px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-green-400 font-mono text-sm sm:text-lg font-bold hover:text-green-300 transition">
            &gt;_ Kuba - SP3FCK
          </Link>
          <nav className="hidden sm:flex gap-4 text-xs">
            <Link 
              href="/" 
              className={`font-mono ${pathname === '/' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'} transition`}
            >
              Terminal
            </Link>
            <Link 
              href="https://qrz.com/db/SP3FCK" target="_blank" rel="noopener noreferrer"
              className={`font-mono ${pathname.startsWith('https://qrz.com/db/SP3FCK') ? 'text-green-400' : 'text-gray-400 hover:text-green-400'} transition`}
            >
              qrz
            </Link>
          </nav>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer" title="Minimize" />
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer" title="Maximize" />
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer" title="Close" />
        </div>
      </div>
    </header>
  );
}

