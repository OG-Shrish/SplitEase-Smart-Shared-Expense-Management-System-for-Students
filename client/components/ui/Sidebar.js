"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Receipt, PieChart, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/groups', label: 'Groups', icon: Users },
    { href: '/expenses', label: 'Expenses', icon: Receipt },
    { href: '/balances', label: 'Balances & Settlements', icon: Wallet },
    { href: '/analytics', label: 'Analytics', icon: PieChart },
  ];

  return (
    <div className="w-64 bg-cards border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">SplitEase</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
