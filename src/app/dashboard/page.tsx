'use client';

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-900 dark:text-amber-100">Yüklənir...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 lg:pt-0">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100">
                Aida's Corners
              </h1>
              <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                İdarəetmə Paneli
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-amber-900 dark:text-amber-100">{user?.email}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Admin</p>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
              >
                Çıxış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Statistika Kartı */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Ümumi Filiallar
            </h3>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">12</p>
          </div>

          {/* Aktiv Sifarişlər */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Aktiv Sifarişlər
            </h3>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">48</p>
          </div>

          {/* Aylıq Gəlir */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Aylıq Gəlir
            </h3>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">₼ 24,500</p>
          </div>
        </div>

        {/* Son Sifarişlər Bölməsi */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-amber-900 dark:text-amber-100 mb-4">
            Son Sifarişlər
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-200 dark:divide-gray-700">
              <thead className="bg-amber-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    Sifariş ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    Filial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    Məbləğ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-amber-200 dark:divide-gray-700">
                <tr className="hover:bg-amber-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 dark:text-amber-100">
                    #12345
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 dark:text-amber-100">
                    28 May Filialı
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 dark:text-amber-100">
                    ₼ 150
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                      Tamamlandı
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-amber-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 dark:text-amber-100">
                    #12346
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 dark:text-amber-100">
                    Gənclik Filialı
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 dark:text-amber-100">
                    ₼ 220
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100">
                      Hazırlanır
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 