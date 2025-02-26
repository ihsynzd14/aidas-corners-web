'use client';

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/providers/theme-provider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen">
        {!isLoginPage && <Sidebar />}
        <main className={cn("flex-1 bg-gray-50 dark:bg-gray-900", isLoginPage && "w-full")}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
} 