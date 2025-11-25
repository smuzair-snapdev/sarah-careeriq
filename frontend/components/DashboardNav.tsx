"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'My Profile', href: '/dashboard/profile', icon: '👤' },
  { name: 'Benchmark Report', href: '/dashboard/benchmark', icon: '📈' },
  { name: 'Career Plan', href: '/dashboard/plan', icon: '🎯' },
  { name: 'Progress', href: '/dashboard/progress', icon: '📅' },
];

export default function DashboardNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CareerIQ</span>
            </div>
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    pathname === item.href
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden border-t border-gray-200">
        <nav className="flex overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex-1 text-center px-3 py-3 text-xs font-medium border-b-2',
                pathname === item.href
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-700'
              )}
            >
              <div>{item.icon}</div>
              <div className="mt-1">{item.name}</div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
