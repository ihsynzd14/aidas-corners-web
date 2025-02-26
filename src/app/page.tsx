'use client';

import { Suspense, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-amber-800">Yüklənir...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-6">
            Aida&apos;s Corners
          </h1>
          <p className="text-xl text-amber-800 mb-8">
            Françayzinq İdarəetmə Portalına Xoş Gəlmisiniz
          </p>
          
          <div className="space-y-4">
            <Link
              href="/login"
              className="inline-block bg-amber-800 text-white px-8 py-3 rounded-lg transition-colors duration-300 hover:bg-amber-700"
            >
              Daxil Ol
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 