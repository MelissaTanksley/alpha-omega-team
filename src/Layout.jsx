import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, GraduationCap, Church, LogOut, LogIn, User, Menu, X, BookMarked, Save, Moon, Sun, ChevronDown, Search, Home } from 'lucide-react';
import NotificationBell from './components/notifications/NotificationBell';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadUser();
    loadAllUsers();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Default to light mode
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
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
      favicon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/355ef2673_FinalAOLogo.png';

      // Open Graph image for search results
      let ogImage = document.querySelector("meta[property='og:image']");
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/83ee761b2_Designer2.png';

      // Twitter card image
      let twitterImage = document.querySelector("meta[name='twitter:image']");
      if (!twitterImage) {
        twitterImage = document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImage);
      }
      twitterImage.content = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/83ee761b2_Designer2.png';
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

  const loadAllUsers = async () => {
    try {
      const users = await base44.entities.User.list('-updated_date', 20);
      // Only show users who have is_visible set to true
      const visibleUsers = users.filter(u => u.is_visible !== false);
      setAllUsers(visibleUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const navigation = [
    { 
      name: 'AI Assistant', 
      icon: BookOpen, 
      page: 'AIChat',
      dropdown: [
        { name: 'AI Chat', icon: BookOpen, page: 'AIChat' },
        { name: 'Writing Assistant', icon: FileText, page: 'WritingAssistant' },
        { name: 'Bible Study', icon: GraduationCap, page: 'BibleAssistant' },
        { name: 'Kids Bible Study', icon: BookOpen, page: 'KidsBibleStudy' },
        { name: 'Topical Studies', icon: GraduationCap, page: 'TopicalStudies' },
        { name: 'Notes', icon: BookMarked, page: 'Notes' },
        { name: 'Saved Content', icon: Save, page: 'SavedContent' }
      ]
    },
    { 
      name: 'Community', 
      icon: Church, 
      page: 'Forum',
      dropdown: [
        { name: 'Forum', icon: Church, page: 'Forum' },
        { name: 'Churches', icon: Church, page: 'Churches' },
        { name: 'Sermons', icon: BookOpen, page: 'Sermons' },
        { name: 'Bible Search', icon: Search, page: 'BibleSearch' },
        { name: 'Messages', icon: BookOpen, page: 'Messages' },
        { name: 'Search', icon: Search, page: 'Search' }
      ]
    },
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
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/bcd22d9af_FinalAOLogo.png"
                  alt="Alpha Omega"
                  className="h-16 w-16 object-contain group-hover:opacity-90 transition-opacity"
                />
              </Link>

              {/* Navigation */}
              <nav className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1">
                  <Link to={createPageUrl('Home')} className="hidden md:block">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${
                        currentPageName === 'Home'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : isDarkMode 
                            ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'
                            : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Home className="h-4 w-4" />
                    </Button>
                  </Link>
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
                                  : isDarkMode 
                                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'
                                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.name}
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-64">
                            {item.name === 'Community' && user && (
                              <>
                                <div className="px-2 py-1.5 text-xs text-slate-500 border-b">
                                  Logged in as: <span className="font-semibold text-slate-700">{user.full_name || user.email}</span>
                                </div>
                              </>
                            )}
                            {item.dropdown.map((dropItem) => (
                              <DropdownMenuItem key={dropItem.page} asChild>
                                <Link to={createPageUrl(dropItem.page)} className="flex items-center gap-2 cursor-pointer">
                                  <dropItem.icon className="h-4 w-4" />
                                  {dropItem.name}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                            {item.name === 'Community' && user && allUsers.length > 0 && (
                              <>
                                <div className="px-2 py-1.5 text-xs text-slate-500 border-t mt-1">
                                  Active Members ({allUsers.length})
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {allUsers.slice(0, 10).map((u) => (
                                    <div key={u.id} className="px-2 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50">
                                      {u.profile_picture_url ? (
                                        <img src={u.profile_picture_url} alt={u.full_name} className="w-5 h-5 rounded-full object-cover" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center">
                                          <User className="w-3 h-3 text-slate-600" />
                                        </div>
                                      )}
                                      <span className="text-slate-700 truncate">{u.full_name || u.email}</span>
                                      {u.reputation !== undefined && (
                                        <span className="text-amber-600 ml-auto">⭐ {u.reputation}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    }

                    const isActive = currentPageName === item.page;
                    return (
                      <Link key={item.page} to={createPageUrl(item.page)} className="hidden md:block">
                        <Button
                          variant="ghost"
                          className={`flex items-center gap-2 whitespace-nowrap ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                              : isDarkMode 
                                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'
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
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile Menu - Show all navigation in dropdown */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={isDarkMode 
                          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                        }
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 max-h-[80vh] overflow-y-auto">
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Home')} className="flex items-center gap-2 cursor-pointer">
                          <Home className="h-4 w-4" />
                          Home
                        </Link>
                      </DropdownMenuItem>
                      {navigation.map((navItem) => {
                        if (navItem.dropdown) {
                          return navItem.dropdown.map((dropItem) => (
                            <DropdownMenuItem key={dropItem.page} asChild>
                              <Link to={createPageUrl(dropItem.page)} className="flex items-center gap-2 cursor-pointer">
                                <dropItem.icon className="h-4 w-4" />
                                {dropItem.name}
                              </Link>
                            </DropdownMenuItem>
                          ));
                        }
                        return (
                          <DropdownMenuItem key={navItem.page} asChild>
                            <Link to={createPageUrl(navItem.page)} className="flex items-center gap-2 cursor-pointer">
                              <navItem.icon className="h-4 w-4" />
                              {navItem.name}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {user && (
                  <>
                    <NotificationBell userEmail={user.email} />
                    <Link to={createPageUrl('UserProfile') + '?email=' + user.email}>
                      <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer hover:border-amber-500 transition-colors ${
                        isDarkMode ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-300'
                      }`}>
                        {user.profile_picture_url ? (
                          <img src={user.profile_picture_url} alt={user.full_name} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <User className={`h-4 w-4 ${isDarkMode ? 'text-blue-600' : 'text-slate-600'}`} />
                        )}
                        <span className="text-sm text-slate-700">{user.full_name || user.email}</span>
                      </div>
                    </Link>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={`${isDarkMode ? 'text-slate-600 hover:text-amber-400' : 'text-slate-700 hover:text-amber-500'} hover:bg-amber-50`}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                {user ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                    className="text-slate-600 hover:text-green-600 hover:bg-green-50"
                  >
                    <LogIn className="h-5 w-5" />
                  </Button>
                )}
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
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-orange-600'}`}>
                  © 2025 Alpha Omega AI
                </p>
                <div className="flex gap-4">
                  <Link to={createPageUrl('AISettings')} className={`text-sm hover:underline ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-700'}`}>
                    AI Settings
                  </Link>
                  <Link to={createPageUrl('Store')} className={`text-sm hover:underline ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-700'}`}>
                    Store
                  </Link>
                  <Link to={createPageUrl('ContactUs')} className={`text-sm hover:underline ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-700'}`}>
                    Contact Us
                  </Link>
                  <Link to={createPageUrl('Payments')} className={`text-sm hover:underline ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-700'}`}>
                    Donate
                  </Link>
                </div>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
}