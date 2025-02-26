'use client';

import { Suspense, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-amber-800 text-xl font-medium"
        >
          Yüklənir...
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl"
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
          className="absolute top-1/3 -right-48 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl"
        />
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="mb-12"
          >
            <div className="relative w-48 h-48 mx-auto mb-8">
              <Image
                src="/images/avatar.jpg"
                alt="Aida's Corners - Şef"
                fill
                className="rounded-full object-cover shadow-2xl border-4 border-amber-200"
                priority
              />
              <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 to-transparent"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold text-amber-900 mb-6 tracking-tight">
                Aida&apos;s Corners
              </h1>
              <p className="text-2xl text-amber-800 mb-4 font-medium">
                Françayzinq İdarəetmə Portalına Xoş Gəlmisiniz
              </p>
              <p className="text-lg text-amber-700 mb-8 max-w-2xl mx-auto">
                Azərbaycanın ən sevimli desert və qəhvə şəbəkəsinin rəqəmsal idarəetmə mərkəzinə xoş gəlmisiniz
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
                {[
                  { value: '15+', label: 'Filial' },
                  { value: '10+', label: 'İşçi' },
                  { value: '50+', label: 'Desert Növü' },
                  { value: '100K+', label: 'Xoşbəxt Müştəri' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white/30 backdrop-blur-sm rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-amber-900">{stat.value}</div>
                    <div className="text-sm text-amber-700">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-amber-600 to-amber-800 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <motion.span
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-700"
              />
              <span className="relative flex items-center">
                Daxil Ol
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>

            {/* Social Media Links */}
            <div className="flex justify-center gap-4 mt-8">
              {[
                { icon: 'instagram', href: 'https://instagram.com/aidascorners' },
                { icon: 'facebook', href: 'https://facebook.com/aidascorners' },
                { icon: 'tiktok', href: 'https://tiktok.com/@aidascorners' }
              ].map((social) => (
                <motion.a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
                >
                  <span className="sr-only">{social.icon}</span>
                  {social.icon === 'instagram' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {social.icon === 'facebook' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  )}
                  {social.icon === 'tiktok' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.17-2.39V2h3.45v.43a8.29 8.29 0 006.35 7.51l-2.55.45z"/>
                    </svg>
                  )}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
} 