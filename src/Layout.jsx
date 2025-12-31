import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, GraduationCap, Church, LogOut, User, Menu, X } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navigation = [
    { name: 'AI Assistant', icon: BookOpen, page: 'AIChat' },
    { name: 'Bible Search', icon: BookOpen, page: 'BibleSearch' },
    { name: 'Community', icon: Church, page: 'Forum' },
    { name: 'Notes', icon: BookMarked, page: 'Notes' },
    { name: 'Saved Content', icon: Save, page: 'SavedContent' },
    { name: 'Team Projects', icon: Briefcase, page: 'TeamProjects' },
    { name: 'Donate', icon: FileText, page: 'Payments' }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695442b835cc4742963c476e/3e2e4dd93_Crossandthorns.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/80 to-slate-800/90" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-amber-500/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to={createPageUrl('Home')} className="flex items-center group">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695442b835cc4742963c476e/d70fd8659_Designer.png"
                  alt="Alpha Omega"
                  className="h-16 w-16 object-contain group-hover:opacity-90 transition-opacity"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link key={item.page} to={createPageUrl(item.page)}>
                      <Button
                        variant="ghost"
                        className={`flex items-center gap-2 ${
                          isActive 
                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                            : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              {/* User Menu */}
              <div className="hidden md:flex items-center gap-3">
                {user && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                    <User className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-slate-300">{user.full_name || user.email}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
              <nav className="px-4 py-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link 
                      key={item.page} 
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          isActive 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
                <div className="pt-3 border-t border-slate-800">
                  {user && (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 mb-2">
                      <User className="h-4 w-4 text-amber-400" />
                      {user.full_name || user.email}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-slate-400 text-sm">
              © 2025 Alpha Omega Team
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}