import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Sparkles, ChevronRight, Volume2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function DailyVerse({ progress, onVerseAdvance, onVerseBack }) {
  const [verse, setVerse] = useState(null);
  const [hebrewGreek, setHebrewGreek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMeaning, setLoadingMeaning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (progress) {
      fetchVerse();
    }
  }, [progress]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    
    const checkTheme = setInterval(() => {
      const theme = localStorage.getItem('theme');
      setIsDarkMode(theme === 'dark');
    }, 100);
    
    return () => clearInterval(checkTheme);
  }, []);

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide the Bible verse ${progress.current_book} ${progress.current_chapter}:${progress.current_verse} in the ${progress.preferred_translation || 'KJV'} translation. Return ONLY the verse text, nothing else.`,
        response_json_schema: {
          type: "object",
          properties: {
            verse_text: { type: "string" },
            reference: { type: "string" }
          }
        }
      });
      setVerse(result);
    } catch (error) {
      console.error('Error fetching verse:', error);
    }
    setLoading(false);
  };

  const fetchHebrewGreekMeaning = async () => {
    setLoadingMeaning(true);
    try {
      const isOT = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'].includes(progress.current_book);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze ${progress.current_book} ${progress.current_chapter}:${progress.current_verse} providing college-level biblical scholarship:

1. Original Language: Provide key words in ${isOT ? 'Hebrew' : 'Greek'} with transliteration
2. Word Study: Explain the meaning of 2-3 significant words with their root meanings
3. Theological Significance: What does this verse teach theologically?
4. Historical Context: Brief background information

Make it academic yet accessible, similar to BIOLA University level.`,
        response_json_schema: {
          type: "object",
          properties: {
            original_language: { type: "string" },
            key_words: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  original: { type: "string" },
                  transliteration: { type: "string" },
                  meaning: { type: "string" }
                }
              }
            },
            theological_significance: { type: "string" },
            historical_context: { type: "string" }
          }
        }
      });
      setHebrewGreek(result);
    } catch (error) {
      console.error('Error fetching meaning:', error);
    }
    setLoadingMeaning(false);
  };

  if (loading) {
    return (
      <Card className={isDarkMode 
        ? "bg-gradient-to-br from-blue-400/80 to-blue-300/80 border-blue-400/50" 
        : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50"
      }>
        <CardContent className="p-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={isDarkMode 
        ? "bg-gradient-to-br from-blue-400/80 via-blue-300/80 to-cyan-300/80 border-blue-400/50 shadow-xl overflow-hidden relative"
        : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200/50 shadow-xl overflow-hidden relative"
      }>
        <div className={isDarkMode 
          ? "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full -translate-y-32 translate-x-32"
          : "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full -translate-y-32 translate-x-32"
        } />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={isDarkMode 
                ? "p-2 bg-blue-700 rounded-xl" 
                : "p-2 bg-amber-100 rounded-xl"
              }>
                <Sparkles className={isDarkMode 
                  ? "h-5 w-5 text-blue-100" 
                  : "h-5 w-5 text-amber-600"
                } />
              </div>
              <div>
                <CardTitle className={isDarkMode 
                  ? "text-lg font-semibold text-blue-900" 
                  : "text-lg font-semibold text-amber-900"
                }>Today's Verse</CardTitle>
                <p className={isDarkMode 
                  ? "text-sm text-blue-800/80" 
                  : "text-sm text-amber-700/70"
                }>{progress.current_book} {progress.current_chapter}:{progress.current_verse}</p>
              </div>
            </div>
            <Badge variant="outline" className={isDarkMode 
              ? "bg-blue-700/50 text-blue-900 border-blue-600" 
              : "bg-amber-100/50 text-amber-800 border-amber-300"
            }>
              {progress.preferred_translation || 'KJV'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {verse && (
            <div className="space-y-6">
              <blockquote className={isDarkMode 
                ? "text-xl md:text-2xl font-serif text-blue-950 leading-relaxed italic border-l-4 border-blue-700 pl-6 py-2"
                : "text-xl md:text-2xl font-serif text-amber-950 leading-relaxed italic border-l-4 border-amber-400 pl-6 py-2"
              }>
                "{verse.verse_text}"
              </blockquote>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchHebrewGreekMeaning}
                  disabled={loadingMeaning}
                  className={isDarkMode 
                    ? "bg-white/50 border-blue-600 text-blue-900 hover:bg-blue-200"
                    : "bg-white/50 border-amber-300 text-amber-800 hover:bg-amber-100"
                  }
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {loadingMeaning ? 'Loading...' : 'Hebrew/Greek Study'}
                </Button>

                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onVerseBack}
                  disabled={progress.current_verse <= 1}
                  className={isDarkMode 
                    ? "bg-white/50 border-blue-600 text-blue-900 hover:bg-blue-200"
                    : "bg-white/50 border-amber-300 text-amber-800 hover:bg-amber-100"
                  }
                >
                  Go Back
                </Button>

                <Button 
                  onClick={onVerseAdvance}
                  className={isDarkMode 
                    ? "bg-blue-700 hover:bg-blue-800 text-white"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                  }
                >
                  Next Verse
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {hebrewGreek && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={isDarkMode 
                    ? "mt-6 p-6 bg-white/80 rounded-xl border border-blue-400 space-y-4"
                    : "mt-6 p-6 bg-white/70 rounded-xl border border-amber-200 space-y-4"
                  }
                >
                  <h4 className={isDarkMode 
                    ? "font-semibold text-blue-900 flex items-center gap-2"
                    : "font-semibold text-amber-900 flex items-center gap-2"
                  }>
                    <BookOpen className="h-4 w-4" />
                    Original Language Study
                  </h4>
                  
                  <div className="grid gap-4">
                    {hebrewGreek.key_words?.map((word, idx) => (
                      <div key={idx} className={isDarkMode 
                        ? "p-4 bg-blue-100 rounded-lg"
                        : "p-4 bg-amber-50 rounded-lg"
                      }>
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className={isDarkMode 
                            ? "text-2xl font-bold text-blue-800"
                            : "text-2xl font-bold text-amber-800"
                          }>{word.original}</span>
                          <span className={isDarkMode 
                            ? "text-sm text-blue-700"
                            : "text-sm text-amber-600"
                          }>({word.transliteration})</span>
                          <span className="text-sm font-medium">"{word.word}"</span>
                        </div>
                        <p className={isDarkMode 
                          ? "text-sm text-blue-900/80"
                          : "text-sm text-amber-900/80"
                        }>{word.meaning}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className={isDarkMode 
                        ? "font-medium text-blue-900 mb-1"
                        : "font-medium text-amber-900 mb-1"
                      }>Theological Significance</h5>
                      <p className={isDarkMode 
                        ? "text-sm text-blue-800/80"
                        : "text-sm text-amber-800/80"
                      }>{hebrewGreek.theological_significance}</p>
                    </div>
                    <div>
                      <h5 className={isDarkMode 
                        ? "font-medium text-blue-900 mb-1"
                        : "font-medium text-amber-900 mb-1"
                      }>Historical Context</h5>
                      <p className={isDarkMode 
                        ? "text-sm text-blue-800/80"
                        : "text-sm text-amber-800/80"
                      }>{hebrewGreek.historical_context}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}