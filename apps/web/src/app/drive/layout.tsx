'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useSidebar } from '@/store/use-sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { isOpen } = useSidebar();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={cn('flex-1 transition-all duration-300', isOpen ? 'ml-64' : 'ml-16')}>
        <Header />
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
