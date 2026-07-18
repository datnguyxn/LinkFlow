'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import Container from '../common/Container';
import Logo from '../common/Logo';
import LanguageSwitcher from '../common/LanguageSwitcher';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('@/components/common/ThemeToggle'), {
  ssr: false,
});

const menus = [
  {
    title: 'Features',
    href: '#features',
  },
  {
    title: 'Analytics',
    href: '#analytics',
  },
  {
    title: 'Security',
    href: '#security',
  },
  {
    title: 'Pricing',
    href: '#pricing',
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="
      sticky
      top-0
      z-50
      border-b
      bg-white/80
      backdrop-blur-lg
    "
    >
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden gap-8 md:flex">
          {menus.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-sm text-slate-600 transition hover:text-black"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />

          <ThemeToggle />

          <>
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-black transition hover:text-blue-600 dark:text-white"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </Container>

      {open && (
        <div className="border-t md:hidden">
          <Container className="flex flex-col py-5">
            {menus.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="py-3 mt-5 text-sm text-slate-600 transition hover:text-black"
              >
                {item.title}
              </Link>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}
