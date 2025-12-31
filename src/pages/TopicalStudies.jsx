import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopicalStudies() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [studyContent, setStudyContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const popularTopics = [
    { name: 'Faith', icon: '✝️', color: 'bg-blue-500' },
    { name: 'Love', icon: '❤️', color: 'bg-red-500' },
    { name: 'Prayer', icon: '🙏', color: 'bg-purple-500' },
    { name: 'Grace', icon: '🕊️', color: 'bg-green-500' },
    { name: 'Salvation', icon: '⛪', color: 'bg-amber-500' },
    { name: 'Hope', icon: '🌟', color: 'bg-cyan-500' },
    { name: 'Wisdom', icon: '📖', color: 'bg-indigo-500' },
    { name: 'Forgiveness', icon: '🤝', color: 'bg-pink-500' },
    { name: 'Peace', icon: '☮️', color: 'bg-teal-500' },
    { name: 'Joy', icon: '😊', color: 'bg-yellow-500' },
    { name: 'Strength', icon: '💪', color: 'bg-orange-500' },
    { name: 'Obedience', icon: '👂', color: 'bg-lime-500' }
  ];

  const fetchTopicalStudy = async (topic) => {
    setLoading(true);
    setSelectedTopic(topic);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive Bible study on the topic of "${topic}". Include:
        1. Overview: Brief introduction to this topic in Scripture
        2. Key Verses: 8-10 essential Bible verses about this topic with full text
        3. Old Testament Perspective: How this topic appears in the OT
        4. New Testament Perspective: How this topic is developed in the NT
        5. Practical Application: 5 ways to apply this topic in daily life
        6. Study Questions: 5 deep reflection questions
        7. Prayer Points: 3 prayer prompts related to this topic
        
        Make it college-level theological depth but accessible.`,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            key_verses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reference: { type: "string" },
                  text: { type: "string" },
                  insight: { type: "string" }
                }
              }
            },
            old_testament: { type: "string" },
            new_testament: { type: "string" },
            applications: {
              type: "array",
              items: { type: "string" }
            },
            study_questions: {
              type: "array",
              items: { type: "string" }
            },
            prayer_points: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setStudyContent(result);
    } catch (error) {
      console.error('Error fetching topical study:', error);
    }
    
    setLoading(false);
  };

  const handleCustomTopic = () => {
    if (customTopic.trim()) {
      fetchTopicalStudy(customTopic.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Topical Bible Studies</h1>
        <p className="text-slate-300">Explore Scripture by topic with AI-powered insights</p>
      </div>

      {!studyContent ? (
        <>
          {/* Popular Topics */}
          <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {popularTopics.map((topic) => (
                  <Button
                    key={topic.name}
                    onClick={() => fetchTopicalStudy(topic.name)}
                    className={`${topic.color} hover:opacity-90 h-20 flex flex-col items-center justify-center gap-2`}
                    disabled={loading}
                  >
                    <span className="text-2xl">{topic.icon}</span>
                    <span className="text-sm font-semibold">{topic.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Topic Search */}
          <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Custom Topic Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter any biblical topic (e.g., perseverance, baptism, prophets...)"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomTopic()}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Button
                  onClick={handleCustomTopic}
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={loading || !customTopic.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Study
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <Card className="bg-gradient-to-br from-amber-900/70 to-orange-900/70 backdrop-blur-sm border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Study: {selectedTopic}</h2>
                    <p className="text-amber-200">{studyContent.overview}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStudyContent(null);
                      setSelectedTopic(null);
                    }}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    ← Back
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Study Content Tabs */}
            <Tabs defaultValue="verses" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="verses">Key Verses</TabsTrigger>
                <TabsTrigger value="perspectives">Perspectives</TabsTrigger>
                <TabsTrigger value="application">Application</TabsTrigger>
                <TabsTrigger value="study">Study & Prayer</TabsTrigger>
              </TabsList>

              <TabsContent value="verses" className="space-y-4">
                {studyContent.key_verses?.map((verse, idx) => (
                  <Card key={idx} className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                    <CardContent className="p-6">
                      <Badge className="bg-amber-600 mb-3">{verse.reference}</Badge>
                      <blockquote className="text-lg text-slate-200 italic border-l-4 border-amber-400 pl-4 mb-3">
                        "{verse.text}"
                      </blockquote>
                      <p className="text-sm text-slate-400">{verse.insight}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="perspectives" className="space-y-4">
                <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Old Testament Perspective</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{studyContent.old_testament}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">New Testament Perspective</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{studyContent.new_testament}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="application" className="space-y-4">
                <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Practical Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studyContent.applications?.map((app, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-amber-900/20 rounded-lg border border-amber-500/20">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-slate-300 flex-1">{app}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="study" className="space-y-4">
                <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Study Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studyContent.study_questions?.map((question, idx) => (
                        <div key={idx} className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                          <p className="text-slate-300">{idx + 1}. {question}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Prayer Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studyContent.prayer_points?.map((prayer, idx) => (
                        <div key={idx} className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20 flex gap-3">
                          <span className="text-2xl">🙏</span>
                          <p className="text-slate-300 flex-1">{prayer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </AnimatePresence>
      )}

      {loading && (
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Generating Study...</h3>
            <p className="text-slate-500">Searching Scripture for insights on {selectedTopic}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}