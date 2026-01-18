import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DailyVerse from '../components/bible/DailyVerse';
import TranslationSelector from '../components/bible/TranslationSelector';
import LoginModal from '../components/auth/LoginModal';
import { BookOpen, TrendingUp, CheckCircle2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function HomeSpanish() {
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const queryClient = useQueryClient();

  const bibleBookTranslations = {
    'Genesis': 'Génesis',
    'Exodus': 'Éxodo',
    'Leviticus': 'Levítico',
    'Numbers': 'Números',
    'Deuteronomy': 'Deuteronomio',
    'Joshua': 'Josué',
    'Judges': 'Jueces',
    'Ruth': 'Rut',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reyes',
    '2 Kings': '2 Reyes',
    '1 Chronicles': '1 Crónicas',
    '2 Chronicles': '2 Crónicas',
    'Ezra': 'Esdras',
    'Nehemiah': 'Nehemías',
    'Esther': 'Ester',
    'Job': 'Job',
    'Psalms': 'Salmos',
    'Proverbs': 'Proverbios',
    'Ecclesiastes': 'Eclesiastés',
    'Song of Solomon': 'Cantar de los Cantares',
    'Isaiah': 'Isaías',
    'Jeremiah': 'Jeremías',
    'Lamentations': 'Lamentaciones',
    'Ezekiel': 'Ezequiel',
    'Daniel': 'Daniel',
    'Hosea': 'Oseas',
    'Joel': 'Joel',
    'Amos': 'Amós',
    'Obadiah': 'Abdías',
    'Jonah': 'Jonás',
    'Micah': 'Miqueas',
    'Nahum': 'Nahúm',
    'Habakkuk': 'Habacuc',
    'Zephaniah': 'Sofonías',
    'Haggai': 'Hageo',
    'Zechariah': 'Zacarías',
    'Malachi': 'Malaquías',
    'Matthew': 'Mateo',
    'Mark': 'Marcos',
    'Luke': 'Lucas',
    'John': 'Juan',
    'Acts': 'Hechos',
    'Romans': 'Romanos',
    '1 Corinthians': '1 Corintios',
    '2 Corinthians': '2 Corintios',
    'Galatians': 'Gálatas',
    'Ephesians': 'Efesios',
    'Philippians': 'Filipenses',
    'Colossians': 'Colosenses',
    '1 Thessalonians': '1 Tesalonicenses',
    '2 Thessalonians': '2 Tesalonicenses',
    '1 Timothy': '1 Timoteo',
    '2 Timothy': '2 Timoteo',
    'Titus': 'Tito',
    'Philemon': 'Filemón',
    'Hebrews': 'Hebreos',
    'James': 'Santiago',
    '1 Peter': '1 Pedro',
    '2 Peter': '2 Pedro',
    '1 John': '1 Juan',
    '2 John': '2 Juan',
    '3 John': '3 Juan',
    'Jude': 'Judas',
    'Revelation': 'Apocalipsis'
  };

  useEffect(() => {
    initializeUser();
    setResetKey(prev => prev + 1);
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);

      // Auto-prompt after a short delay
      setTimeout(() => {
        if (e && !localStorage.getItem('installPromptDismissed')) {
          e.prompt();
          e.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'dismissed') {
              localStorage.setItem('installPromptDismissed', 'true');
            }
          });
        }
      }, 3000);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const initializeUser = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    }
  };

  const { data: progress, isLoading } = useQuery({
    queryKey: ['userProgress', user?.email || 'anonymous'],
    queryFn: async () => {
      if (!user) {
        // Return default progress for anonymous users
        return {
          current_book: 'Genesis',
          current_chapter: 1,
          current_verse: 1,
          preferred_translation: 'KJV',
          verses_read: 0,
          last_login_date: format(new Date(), 'yyyy-MM-dd')
        };
      }
      const results = await base44.entities.UserBibleProgress.filter({ created_by: user.email });
      if (results.length === 0) {
        return await base44.entities.UserBibleProgress.create({
          current_book: 'Genesis',
          current_chapter: 1,
          current_verse: 1,
          preferred_translation: 'KJV',
          verses_read: 0,
          last_login_date: format(new Date(), 'yyyy-MM-dd')
        });
      }
      return results[0];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (updates) => {
      if (!user || !progress.id) {
        // For anonymous users, just update local state
        return { ...progress, ...updates };
      }
      return await base44.entities.UserBibleProgress.update(progress.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
    }
  });

  const handleVerseAdvance = async () => {
    if (!user) {
      setLoginAction('avanzar al siguiente versículo');
      setShowLoginModal(true);
      return;
    }
    const nextVerse = progress.current_verse + 1;
    const currentCount = progress.verses_read || 0;
    const newVerseCount = nextVerse > currentCount ? nextVerse : currentCount;
    await updateProgressMutation.mutateAsync({
      current_verse: nextVerse,
      verses_read: newVerseCount,
      last_login_date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const handleVerseBack = async () => {
    if (!user) {
      setLoginAction('regresar a versículos anteriores');
      setShowLoginModal(true);
      return;
    }
    if (progress.current_verse > 1) {
      await updateProgressMutation.mutateAsync({
        current_verse: progress.current_verse - 1
      });
    }
  };

  const handleTranslationChange = async (translation) => {
    if (!user) {
      setLoginAction('cambiar tu traducción de la Biblia');
      setShowLoginModal(true);
      return;
    }
    await updateProgressMutation.mutateAsync({
      preferred_translation: translation
    });
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-slate-300">Cargando tu versículo diario...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">¡Bienvenido a </span>
          <span className="text-[#A14A3A]">Alfa Omega!</span>
        </h1>
        <p className="text-blue-400 text-lg">
          Escritura Diaria • Herramienta de IA Cristiana y Comunidad
        </p>
        {showInstallButton && (
          <Button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-6 py-2 shadow-lg"
          >
            Agregar al Navegador
          </Button>
        )}
        </motion.div>

      {/* Stats Cards - Only for logged in users */}
      {user && progress?.id && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-slate-900/70 backdrop-blur-sm border-amber-500/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Posición Actual</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {bibleBookTranslations[progress.current_book] || progress.current_book} {progress.current_chapter}:{progress.current_verse}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <BookOpen className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-slate-900/70 backdrop-blur-sm border-green-500/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Versículos Leídos</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {progress.verses_read || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-slate-900/70 backdrop-blur-sm border-blue-500/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Traducción</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    NTV
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 bg-blue-500/20 rounded-xl hover:bg-blue-500/30"
                >
                  <Settings className="h-6 w-6 text-blue-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}

      {/* Settings Panel - Only for logged in users */}
      {user && progress?.id && showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-200">Preferencias de Lectura</CardTitle>
            </CardHeader>
            <CardContent>
              <TranslationSelector
                value={progress.preferred_translation || 'KJV'}
                onChange={handleTranslationChange}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Verse - Personalized for logged in users */}
      {user && progress?.id && (
        <DailyVerse key={resetKey} progress={progress} onVerseAdvance={handleVerseAdvance} onVerseBack={handleVerseBack} language="es" />
      )}

      {/* Guest View - Static verse for non-logged in users */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DailyVerse 
            progress={{
              current_book: 'John',
              current_chapter: 3,
              current_verse: 16,
              preferred_translation: 'KJV'
            }} 
            onVerseAdvance={() => base44.auth.redirectToLogin(window.location.pathname)}
            onVerseBack={() => base44.auth.redirectToLogin(window.location.pathname)}
            language="es"
          />
          <Card className="bg-blue-500/20 border-blue-500/50 mt-4">
            <CardContent className="p-6 text-center">
              <p className="text-blue-200 mb-4">
                ¡Inicia sesión para rastrear tu progreso, guardar notas y comenzar tu viaje personalizado de lectura bíblica!
              </p>
              <Button 
                onClick={() => {
                  setLoginAction('rastrear tu progreso y guardar notas');
                  setShowLoginModal(true);
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Iniciar Sesión para Continuar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Info */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 text-lg mb-2">Tu Viaje Bíblico</h3>
              <p className="text-slate-400 leading-relaxed">
                Estás leyendo toda la Biblia, un versículo a la vez. Cada vez que inicias sesión, 
                recibirás el siguiente versículo en secuencia, comenzando desde Génesis 1:1. Explora estudios 
                profundos de palabras, toma notas y crece en tu comprensión de la Palabra de Dios.
              </p>
            </div>
            </div>
            </CardContent>
            </Card>

            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)}
              action={loginAction}
            />
            </div>
            );
            }