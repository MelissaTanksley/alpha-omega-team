import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, GraduationCap, Church, LogOut, User, Menu, X, BookMarked, Save, Moon, Sun, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadUser();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    // Set favicon and meta tags for search engines
    const setMetaTags = () => {
      // Favicon
      let favicon = document.querySelector("link[rel*='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/eb805b8aa_Designer2.png';

      // Open Graph image for search results
      let ogImage = document.querySelector("meta[property='og:image']");
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/eb805b8aa_Designer2.png';

      // Twitter card image
      let twitterImage = document.querySelector("meta[name='twitter:image']");
      if (!twitterImage) {
        twitterImage = document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImage);
      }
      twitterImage.content = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/eb805b8aa_Designer2.png';
    };

    setMetaTags();
  }, []);

  const loadUser = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      // User not authenticated, this is normal for public apps
      setUser(null);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const navigation = [
    { name: 'Home', icon: BookOpen, page: 'Home' },
    { 
      name: 'AI Assistant', 
      icon: BookOpen, 
      page: 'AIChat',
      dropdown: [
        { name: 'AI Chat', icon: BookOpen, page: 'AIChat' },
        { name: 'Notes', icon: BookMarked, page: 'Notes' },
        { name: 'Saved Content', icon: Save, page: 'SavedContent' }
      ]
    },
    { name: 'Community', icon: Church, page: 'Forum' },
    { name: 'Store', icon: BookMarked, page: 'Store' },
    { name: 'Contact Us', icon: FileText, page: 'ContactUs' },
    { name: 'Donate', icon: FileText, page: 'Payments' },
    { name: 'AI Settings', icon: User, page: 'AISettings' },
    { name: 'Español', icon: BookOpen, page: 'HomeSpanish' }
  ];

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: isDarkMode 
            ? 'none'
            : 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695442b835cc4742963c476e/6cd0d3412_image.png)',
          backgroundColor: isDarkMode ? '#0a1929' : 'transparent',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className={`backdrop-blur-sm border-b shadow-lg ${
          isDarkMode 
            ? 'bg-slate-900/95 border-slate-700' 
            : 'bg-orange-500/95 border-orange-300'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <Link to={createPageUrl('Home')} className="flex items-center group flex-shrink-0">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695442b835cc4742963c476e/d70fd8659_Designer.png"
                  alt="Alpha Omega"
                  className="h-16 w-16 object-contain group-hover:opacity-90 transition-opacity border-2 border-white rounded-lg"
                  style={{filter: 'brightness(0) invert(1)'}}
                />
              </Link>

              {/* Scrollable Navigation */}
              <nav className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 min-w-max">
                  {navigation.map((item) => {
                    if (item.dropdown) {
                      const isActive = item.dropdown.some(d => d.page === currentPageName);
                      return (
                        <DropdownMenu key={item.name}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`flex items-center gap-2 whitespace-nowrap ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                  : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.name}
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {item.dropdown.map((dropItem) => (
                              <DropdownMenuItem key={dropItem.page} asChild>
                                <Link to={createPageUrl(dropItem.page)} className="flex items-center gap-2 cursor-pointer">
                                  <dropItem.icon className="h-4 w-4" />
                                  {dropItem.name}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    }

                    const isActive = currentPageName === item.page;
                    return (
                      <Link key={item.page} to={createPageUrl(item.page)}>
                        <Button
                          variant="ghost"
                          className={`flex items-center gap-2 whitespace-nowrap ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                              : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {user && (
                  <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                    isDarkMode ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-300'
                  }`}>
                    <User className={`h-4 w-4 ${isDarkMode ? 'text-blue-600' : 'text-slate-600'}`} />
                    <span className="text-sm text-slate-700">{user.full_name || user.email}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={`${isDarkMode ? 'text-slate-600 hover:text-amber-400' : 'text-slate-700 hover:text-amber-500'} hover:bg-amber-50`}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>


        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-transparent bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className={`text-center text-sm ${isDarkMode ? 'text-blue-400' : 'text-slate-600'}`}>
                © 2025 Alpha Omega Team
              </p>
            </div>
          </footer>
      </div>
    </div>
  );
}