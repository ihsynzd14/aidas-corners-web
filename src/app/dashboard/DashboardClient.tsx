'use client';

import { ThemeProvider } from '@/providers/theme-provider';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-amber-800">Yüklənir...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-amber-50/30 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 ml-16 transition-all duration-300">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
} 