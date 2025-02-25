'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  HomeIcon, ChartBarIcon, ShoppingCartIcon, BeakerIcon, 
  BuildingStorefrontIcon, CubeIcon, WrenchScrewdriverIcon,
  Cog6ToothIcon, BellIcon, SparklesIcon, ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon, SunIcon, MoonIcon, XMarkIcon, Bars3Icon
} from '@heroicons/react/24/outline';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  badge?: string;
}

const mainMenu: MenuItem[] = [
  { title: 'Ana Səhifə', path: '/dashboard', icon: HomeIcon },
  { title: 'Yeni Sifarişlər', path: '/dashboard/new-orders', icon: ShoppingCartIcon },
  { title: 'Məhsul Statistikası', path: '/dashboard/statistics', icon: ChartBarIcon },
  { 
    title: 'AI Köməkçi', 
    path: '/dashboard/ai-assistant', 
    icon: SparklesIcon,
    badge: 'Tezliklə' 
  },
  { title: 'Stok və Hazırlıq', path: '/dashboard/stock', icon: BeakerIcon },
];

const managementMenu: MenuItem[] = [
  { title: 'Filial İdarəetməsi', path: '/dashboard/branches', icon: BuildingStorefrontIcon },
  { title: 'Məhsul İdarəetməsi', path: '/dashboard/products', icon: CubeIcon },
  { title: 'Material İzləmə', path: '/dashboard/materials', icon: WrenchScrewdriverIcon },
  { title: 'Tənzimləmələr', path: '/dashboard/settings', icon: Cog6ToothIcon },
  { title: 'Bildirişlər', path: '/dashboard/notifications', icon: BellIcon },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const sidebarVariants = {
    expanded: {
      width: '16rem',
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    collapsed: {
      width: '4rem',
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const MenuLink = ({ item }: { item: MenuItem }) => {
    const isActive = pathname === item.path;
    
    return (
      <Link 
        href={item.path}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100' 
            : 'hover:bg-amber-50 text-amber-700 hover:text-amber-900 dark:text-amber-200 dark:hover:bg-amber-900/10 dark:hover:text-amber-100'
          }
        `}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {item.title}
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100 rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md text-amber-900 dark:text-amber-100 ${className}`}
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`fixed inset-0 bg-black z-40 lg:hidden ${className}`}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-50 lg:hidden flex flex-col ${className}`}
            >
              <div className="flex items-center justify-between p-4 border-b border-amber-100 dark:border-amber-900/20">
                <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                  Aida&apos;s Corners
                </h1>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20"
                >
                  <XMarkIcon className="w-5 h-5 text-amber-900 dark:text-amber-100" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
                <nav className="space-y-1">
                  {mainMenu.map((item) => (
                    <MenuLink key={item.path} item={item} />
                  ))}
                </nav>

                <div className="border-t border-amber-100 dark:border-amber-900/20" />

                <nav className="space-y-1">
                  {managementMenu.map((item) => (
                    <MenuLink key={item.path} item={item} />
                  ))}
                </nav>
              </div>

              {/* Theme Toggle for Mobile */}
              {mounted && (
                <div className="p-4 border-t border-amber-100 dark:border-amber-900/20">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 text-amber-900 dark:text-amber-100 flex items-center justify-center"
                  >
                    {theme === 'dark' ? (
                      <SunIcon className="w-5 h-5" />
                    ) : (
                      <MoonIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className={`
          hidden lg:flex fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-800 shadow-lg z-50
          flex-col transition-colors duration-300 ease-in-out ${className}
          ${isCollapsed ? 'items-center' : 'items-stretch'}
        `}
      >
        {/* Logo */}
        <div className="flex-shrink-0 pt-6 p-4 border-b border-amber-100 dark:border-amber-900/20">
          {!isCollapsed ? (
            <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">Aida&apos;s Corners</h1>
          ) : (
            <span className="text-xl font-bold text-amber-900 dark:text-amber-100">A</span>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-16 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-200"
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="w-4 h-4" />
          ) : (
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          )}
        </button>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          <nav className="space-y-1">
            {mainMenu.map((item) => (
              <MenuLink key={item.path} item={item} />
            ))}
          </nav>

          <div className="border-t border-amber-100 dark:border-amber-900/20" />

          <nav className="space-y-1">
            {managementMenu.map((item) => (
              <MenuLink key={item.path} item={item} />
            ))}
          </nav>
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <div className="flex-shrink-0 p-4 border-t border-amber-100 dark:border-amber-900/20">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 text-amber-900 dark:text-amber-100 flex items-center justify-center"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
} 