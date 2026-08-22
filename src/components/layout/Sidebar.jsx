import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Leaf, Calculator, CalendarClock, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Crop Advisor', path: '/advisor', icon: Leaf },
  { name: 'Profit Calculator', path: '/profit', icon: Calculator },
  { name: 'Scheduler', path: '/scheduler', icon: CalendarClock },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-earth-200 h-screen sticky top-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-earth-200">
        <h1 className="text-2xl font-bold text-leaf-700 flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          Krishi Veda
        </h1>
        <p className="text-sm text-leaf-600 italic mt-1 font-medium">Intelligent Farm OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-leaf-50 text-leaf-700 shadow-sm'
                  : 'text-earth-600 hover:bg-earth-50 hover:text-earth-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-earth-200">
        <div className="bg-earth-50 rounded-xl p-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-earth-900">Kisan User</p>
            <p className="text-xs text-earth-500">Delhi, India</p>
          </div>
          <button className="flex items-center justify-center gap-2 w-full py-2 bg-white text-earth-600 text-sm font-medium rounded-lg border border-earth-200 hover:bg-earth-100 transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
