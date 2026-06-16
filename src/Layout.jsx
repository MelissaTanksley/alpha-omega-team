import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, ClipboardList, LogOut, LogIn, User, Menu, X } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', page: 'Home' },
    { name: 'Assess AI System', path: '/RiskAssessment', page: 'RiskAssessment' },
    { name: 'Dashboard', path: '/RiskDashboard', page: 'RiskDashboard' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">AI Risk Navigator</div>
                <div className="text-blue-400 text-xs leading-tight">for Healthcare</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.page} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-sm font-medium ${
                      currentPageName === item.page
                        ? 'text-blue-400 bg-slate-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-300 text-sm">{user.full_name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => base44.auth.logout('/')}
                    className="text-slate-400 hover:text-red-400 hover:bg-slate-800 h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.page} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <div className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentPageName === item.page
                    ? 'text-blue-400 bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}>
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">AI Risk Navigator for Healthcare</div>
                <div className="text-slate-400 text-xs">AI Governance · Risk Scoring · Decision Support</div>
              </div>
            </div>
            <div className="flex gap-6">
              <Link to="/RiskAssessment" className="text-slate-400 text-sm hover:text-blue-400 transition-colors">Start Assessment</Link>
              <Link to="/RiskDashboard" className="text-slate-400 text-sm hover:text-blue-400 transition-colors">Dashboard</Link>
            </div>
            <p className="text-slate-500 text-xs">© 2026 AI Risk Navigator for Healthcare</p>
          </div>
        </div>
      </footer>
    </div>
  );
}