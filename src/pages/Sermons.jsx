import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Video, Headphones, Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Sermons() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSermon, setSelectedSermon] = useState(null);

  const { data: sermons = [], isLoading } = useQuery({
    queryKey: ['sermons'],
    queryFn: () => base44.entities.Sermon.list('-date', 100)
  });

  const filteredSermons = sermons.filter(sermon => {
    const query = searchQuery.toLowerCase();
    return !query || 
      sermon.title?.toLowerCase().includes(query) ||
      sermon.speaker?.toLowerCase().includes(query) ||
      sermon.church_name?.toLowerCase().includes(query) ||
      sermon.scripture_reference?.toLowerCase().includes(query);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading sermons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-amber-400" />
          Sermons
        </h1>
        <p className="text-slate-300">Listen and learn from powerful messages</p>
      </motion.div>

      {/* Search */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title, speaker, church, or scripture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sermons List */}
      <div className="space-y-4">
        {filteredSermons.map((sermon) => (
          <motion.div
            key={sermon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/30 transition-all">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-slate-200">{sermon.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                      <span>{sermon.speaker}</span>
                      {sermon.church_name && <span>• {sermon.church_name}</span>}
                      {sermon.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(sermon.date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {sermon.video_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(sermon.video_url, '_blank')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </Button>
                    )}
                    {sermon.audio_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(sermon.audio_url, '_blank')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Headphones className="h-4 w-4 mr-1" />
                        Audio
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {sermon.scripture_reference && (
                  <Badge variant="outline" className="text-amber-400 border-amber-400">
                    {sermon.scripture_reference}
                  </Badge>
                )}
                {sermon.series_name && (
                  <Badge className="bg-blue-500">Series: {sermon.series_name}</Badge>
                )}
                {sermon.summary && (
                  <p className="text-slate-300 text-sm">{sermon.summary}</p>
                )}
                {sermon.tags && sermon.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sermon.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-slate-400 border-slate-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {(sermon.notes || sermon.key_points || sermon.discussion_questions) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSermon(selectedSermon?.id === sermon.id ? null : sermon)}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    {selectedSermon?.id === sermon.id ? 'Hide Details' : 'View Details'}
                  </Button>
                )}
                
                {selectedSermon?.id === sermon.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-slate-700 pt-3 mt-3 space-y-3"
                  >
                    {sermon.notes && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-1">Notes:</h4>
                        <p className="text-sm text-slate-400">{sermon.notes}</p>
                      </div>
                    )}
                    {sermon.key_points && sermon.key_points.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-1">Key Points:</h4>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                          {sermon.key_points.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {sermon.discussion_questions && sermon.discussion_questions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-1">Discussion Questions:</h4>
                        <ul className="list-decimal list-inside text-sm text-slate-400 space-y-1">
                          {sermon.discussion_questions.map((question, idx) => (
                            <li key={idx}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSermons.length === 0 && (
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No sermons found</h3>
            <p className="text-slate-500">Try adjusting your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}