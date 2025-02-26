'use client';

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from "framer-motion"
import { ArrowRight, Store, ChartBar, Users2, Shield } from "lucide-react"

export default function WelcomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Store,
      title: "Mağaza İdarəetməsi",
      description: "Bütün mağazalarınızı tək platformadan idarə edin"
    },
    {
      icon: ChartBar,
      title: "Satış Analitikası",
      description: "Real-time satış və performans göstəriciləri"
    },
    {
      icon: Users2,
      title: "İşçi Menecmenti",
      description: "İşçilərinizin iş cədvəli və performansını izləyin"
    },
    {
      icon: Shield,
      title: "Təhlükəsizlik",
      description: "Ən yüksək səviyyədə məlumat təhlükəsizliyi"
    }
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full bg-orange-200/20 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="container relative mx-auto px-4 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-amber-900 mb-6 leading-tight">
              Aida&apos;s Corners&apos;a <br className="hidden sm:block" />
              Xoş Gəlmisiniz
            </h1>
            <p className="text-lg sm:text-xl text-amber-700 mb-12 max-w-2xl mx-auto">
              Françayzinq şəbəkəmizin rəqəmsal idarəetmə platforması ilə biznesinizi daha effektiv idarə edin
            </p>
          </motion.div>
          
          <motion.div 
            className="space-y-4 sm:space-y-0 sm:space-x-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center bg-amber-800 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                İdarəetmə Panelinə Keç
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center bg-amber-800 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Daxil Ol
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
              >
                <feature.icon className="h-12 w-12 text-amber-600 mb-4" />
                <h3 className="text-xl font-semibold text-amber-900 mb-2">{feature.title}</h3>
                <p className="text-amber-700">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  )
} 