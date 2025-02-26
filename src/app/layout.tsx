import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import ClientLayout from '@/components/layout/ClientLayout';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Aidas Corners Web Panel",
  description: "AI Integrated Web Panel and Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}