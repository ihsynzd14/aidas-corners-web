'use client';

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export default function HomePage() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string>('');

  const handleLogin = async (formData: FormData) => {
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      await signIn(email, password);
    } catch (error) {
      setError('Giriş zamanı xəta baş verdi. Zəhmət olmasa məlumatlarınızı yoxlayın.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Sol taraf - Giriş formu */}
        <div className="flex-1 text-center md:text-left">
          <div className="max-w-md mx-auto md:mx-0">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2">
              Aida&apos;s Corners
            </h1>
            <p className="text-lg text-amber-700 mb-8 font-light">
              Françayzinq İdarəetmə Portalı
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">Daxil Ol</h2>
              
              <form action={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-900 block">
                    E-poçt Ünvanı
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/50"
                    placeholder="misal@aidascorners.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-900 block">
                    Şifrə
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="w-full px-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/50"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="rememberMe"
                      className="rounded text-amber-600 focus:ring-amber-500 mr-2" 
                    />
                    <span className="text-sm text-amber-800">Məni xatırla</span>
                  </label>
                  <Link href="/sifremi-unutdum" className="text-sm text-amber-800 hover:text-amber-600">
                    Şifrəmi unutdum
                  </Link>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-800 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Daxil Ol
                </button>
              </form>

              {error && (
                <div className="mt-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ taraf - Dekoratif görsel */}
        <div className="flex-1 relative hidden md:block">
          <Suspense fallback={<div>Yüklənir...</div>}>
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/bg-login.webp"
                alt="Aida&apos;s Corners"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/50 via-amber-900/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Hoş Geldiniz</h3>
                <p className="text-sm opacity-90">
                  Aida's Corners franchise yönetim sistemine giriş yaparak şubelerinizi kolayca yönetebilirsiniz.
                </p>
              </div>
            </div>
          </Suspense>
        </div>
      </div>
    </main>
  )
} 