'use client';

import { useAuth } from '@/providers/auth-provider';
import { useSidebar } from '@/store/use-sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

import { GrokAssistant } from '@/components/ai/GrokAssistant';

export function Header() {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { theme, setTheme } = useTheme();

  return (
    <header 
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 px-4 lg:px-6 shadow-sm"
      style={{ backgroundColor: 'rgb(12 12 12 / 90%)', backdropFilter: 'blur(8px)', color: 'white' }}
    >
      <Button variant="ghost" size="icon" onClick={toggle} className="text-white hover:text-white/80 hover:bg-white/10">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center justify-center">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <img 
            src="https://jupaarquitectura.com/img/logo.svg" 
            alt="JUPA Arquitectura" 
            className="w-[250px] h-auto" 
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <GrokAssistant />
        
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80 hover:bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Button>
        </Link>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-white hover:text-white/80 hover:bg-white/10">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80 hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </Button>
        </Link>

        <Link href="/settings">
          <Avatar className="h-8 w-8 cursor-pointer border border-white/20">
            <AvatarFallback className="bg-white/10 text-white">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
