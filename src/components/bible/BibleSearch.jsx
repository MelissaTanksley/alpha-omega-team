import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Languages, Loader2, BookMarked } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSLATIONS = ['KJV', 'NIV', 'ESV', 'NASB', 'NLT', 'NKJV', 'AMP', 'MSG'];

export default function BibleSearch() {
  const [query, setQuery] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [wordStudy, setWordStudy] = useState(null);
  const [loadingWordStudy, setLoadingWordStudy] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search the Bible for: "${query}"
        
${selectedTranslation === 'all' ? 'Search across all major translations (KJV, NIV, ESV, NASB, NLT)' : `Use ${selectedTranslation} translation`}

If this is a verse reference (like John 3:16), provide that exact verse.
If this is a topic or keyword search, provide up to 8 relevant verses.

Return results with book, chapter, verse, text, and translation.`,
        response_json_schema: {
          type: "object",
          properties: {
            search_type: { type: "string", enum: ["reference", "topic"] },
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reference: { type: "string" },
                  text: { type: "string" },
                  translation: { type: "string" },
                  relevance_note: { type: "string" }
                }
              }
            }
          }
        }
      });
      setResults(result);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleWordStudy = async (verse) => {
    setSelectedVerse(verse);
    setLoadingWordStudy(true);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a college-level word study for ${verse.reference}:

"${verse.text}"

Include:
1. Key Hebrew or Greek words with transliteration
2. Root meanings and etymology
3. How the word is used elsewhere in Scripture
4. Theological implications
5. Application insights

Make this scholarly but accessible (BIOLA University level).`,
        response_json_schema: {
          type: "object",
          properties: {
            verse_reference: { type: "string" },
            language: { type: "string" },
            key_words: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  english: { type: "string" },
                  original: { type: "string" },
                  transliteration: { type: "string" },
                  strongs_number: { type: "string" },
                  root_meaning: { type: "string" },
                  usage_notes: { type: "string" },
                  other_occurrences: { type: "array", items: { type: "string" } }
                }
              }
            },
            theological_insights: { type: "string" },
            application: { type: "string" }
          }
        }
      });
      setWordStudy(result);
    } catch (error) {
      console.error('Word study error:', error);
    }
    setLoadingWordStudy(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <Search className="h-5 w-5" />
            Bible Search
          </CardTitle>
          <p className="text-slate-300 text-sm">Search verses, topics, or references across all translations</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search for a verse, topic, or reference (e.g., 'John 3:16' or 'love')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12 text-lg"
              />
            </div>
            
            <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
              <SelectTrigger className="w-full md:w-40 h-12">
                <SelectValue placeholder="Translation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Translations</SelectItem>
                {TRANSLATIONS.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="h-12 px-8 bg-amber-600 hover:bg-amber-700"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-lg">
                {results.results?.length || 0} Results Found
              </h3>
              <Badge variant="outline" className="ml-2">
                {results.search_type === 'reference' ? 'Verse Reference' : 'Topic Search'}
              </Badge>
            </div>

            <div className="grid gap-4">
              {results.results?.map((verse, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-amber-800">{verse.reference}</span>
                          <Badge variant="secondary" className="text-xs">{verse.translation}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWordStudy(verse)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Languages className="h-4 w-4 mr-1" />
                          Word Study
                        </Button>
                      </div>
                      
                      <p className="text-slate-700 leading-relaxed">{verse.text}</p>
                      
                      {verse.relevance_note && (
                        <p className="text-sm text-slate-500 mt-2 italic">{verse.relevance_note}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVerse && wordStudy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-2 border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Languages className="h-5 w-5" />
                  Word Study: {selectedVerse.reference}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingWordStudy ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {wordStudy.key_words?.map((word, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-amber-200">
                          <div className="flex flex-wrap items-baseline gap-3 mb-2">
                            <span className="text-2xl font-bold text-amber-800">{word.original}</span>
                            <span className="text-amber-600">({word.transliteration})</span>
                            <span className="font-medium">"{word.english}"</span>
                            {word.strongs_number && (
                              <Badge variant="outline" className="text-xs">{word.strongs_number}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{word.root_meaning}</p>
                          <p className="text-sm text-slate-600">{word.usage_notes}</p>
                          {word.other_occurrences?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {word.other_occurrences.slice(0, 5).map((ref, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{ref}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-amber-200">
                        <h5 className="font-semibold text-amber-900 mb-2">Theological Insights</h5>
                        <p className="text-sm text-slate-700">{wordStudy.theological_insights}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-amber-200">
                        <h5 className="font-semibold text-amber-900 mb-2">Application</h5>
                        <p className="text-sm text-slate-700">{wordStudy.application}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}