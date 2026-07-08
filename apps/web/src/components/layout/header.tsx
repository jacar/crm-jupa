'use client';

import { useAuth } from '@/providers/auth-provider';
import { useSidebar } from '@/store/use-sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function Header() {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={toggle}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <Link href="/notifications">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </Link>

      <Link href="/settings">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
