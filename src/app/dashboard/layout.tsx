import { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'İdarəetmə Paneli | Aida\'s Corners',
  description: 'Aida\'s Corners Françayzinq İdarəetmə Portalı',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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