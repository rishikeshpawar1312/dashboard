'use client'; // <-- Add this line to mark this component as a client-side component

import { useState } from 'react';
import { LayoutDashboard, CheckSquare, Code, Calendar, Github, FileText, Upload, Menu, X } from 'lucide-react';
import UserNavigation from '@/frontend/user-navigation';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'tasks', label: 'Tasks & Timer', icon: CheckSquare, href: '/dashboard/tasks' },
  { id: 'leetcode', label: 'LeetCode', icon: Code, href: '/dashboard/leetcode' },
  { id: 'planner', label: 'Planner', icon: Calendar, href: '/dashboard/planner' },
  { id: 'github', label: 'GitHub', icon: Github, href: '/dashboard/github' },
  { id: 'notes', label: 'Notes', icon: FileText, href: '/dashboard/notes' },
  { id: 'documents', label: 'Documents', icon: Upload, href: '/dashboard/documents' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 z-30 transition duration-200 ease-in-out w-64 bg-white border-r`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-xl font-semibold">My App</span>
            <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 transition-colors hover:bg-gray-50"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-auto">
              <UserNavigation />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
