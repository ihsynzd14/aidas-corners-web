'use client';

import { Suspense, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleLogin = async (formData: FormData) => {
    setError('');
    setIsLoading(true);

    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      if (!email || !password) {
        setError('Zəhmət olmasa bütün xanaları doldurun.');
        return;
      }

      await signIn(email, password);
      router.push('/dashboard/');
    } catch (error) {
      setError('Giriş zamanı xəta baş verdi. Zəhmət olmasa məlumatlarınızı yoxlayın.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200">
      {/* Animated background elements */}
      <div className=" inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl z-0"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 2,
          }}
          className="absolute top-1/3 -right-48 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl z-0"
        />
      </div>

      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-24">
          {/* Sol taraf - Giriş formu */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full md:max-w-md"
          >
            <Link 
              href="/"
              className="inline-flex items-center text-amber-900 mb-8 hover:text-amber-700 transition-colors z-10"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ana Səhifə
            </Link>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative w-12 h-12">
                    <Image
                      src="/images/avatar.jpg"
                      alt="Aida's Corners"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-amber-900">
                      Xoş Gəlmisiniz
                    </h1>
                    <p className="text-amber-700">
                      Davam etmək üçün daxil olun
                    </p>
                  </div>
                </div>

                <form action={handleLogin} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-amber-900 block">
                      E-poçt Ünvanı
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/50"
                        placeholder="misal@aidascorners.com"
                        disabled={isLoading}
                      />
                      <svg className="w-5 h-5 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-amber-900 block">
                      Şifrə
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/50"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <svg className="w-5 h-5 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="rememberMe"
                        className="rounded text-amber-600 focus:ring-amber-500 mr-2" 
                        disabled={isLoading}
                      />
                      <span className="text-sm text-amber-800">Məni xatırla</span>
                    </label>
                    <Link href="/sifremi-unutdum" className="text-sm text-amber-800 hover:text-amber-600 transition-colors">
                      Şifrəmi unutdum
                    </Link>
                  </motion.div>

                  <motion.button 
                    type="submit"
                    disabled={isLoading}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg hover:shadow-xl
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-amber-500 hover:to-amber-700'}
                    `}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Daxil olunur...
                      </div>
                    ) : 'Daxil Ol'}
                  </motion.button>
                </form>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Sağ taraf - Dekoratif görsel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 relative hidden md:block"
          >
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/bg-login.webp"
                alt="Aida's Corners"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/50 via-amber-900/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-3xl font-bold mb-4">Xoş Gəlmisiniz</h3>
                  <p className="text-lg opacity-90">
                    Aida's Corners françayzinq idarəetmə sisteminə daxil olaraq filiallarınızı asanlıqla idarə edə bilərsiniz.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}