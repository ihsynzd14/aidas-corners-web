import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'İdarəetmə Paneli | Aida\'s Corners',
  description: 'Aida\'s Corners Françayzinq İdarəetmə Portalı',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardClient>{children}</DashboardClient>;
} 