import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkPlus, Search, Trash2, Star, Copy, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import ContentOrganizer from '../components/ai/ContentOrganizer';

export default function SavedContent() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

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

  const { data: savedContent = [], isLoading } = useQuery({
    queryKey: ['savedContent', user?.email],
    queryFn: () => base44.entities.SavedAIContent.filter({ created_by: user.email }, '-updated_date'),
    enabled: !!user
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedAIContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['savedContent']);
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedAIContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['savedContent']);
    }
  });

  const handleToggleFavorite = (content) => {
    updateContentMutation.mutate({
      id: content.id,
      data: { is_favorite: !content.is_favorite }
    });
  };

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content.content);
    alert('Content copied to clipboard!');
  };

  const handleFilter = ({ search, type, tag }) => {
    setSearchQuery(search);
    setSelectedType(type);
    setSelectedTag(tag);
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
  };

  let filteredContent = savedContent.filter(item => {
    const matchesType = selectedType === 'all' || item.content_type === selectedType;
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || (item.tags || []).includes(selectedTag);
    return matchesType && matchesSearch && matchesTag;
  });

  // Sort content
  filteredContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'oldest':
        return new Date(a.created_date) - new Date(b.created_date);
      case 'favorites':
        return (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const contentTypes = [
    { value: 'all', label: 'All', color: 'bg-slate-500' },
    { value: 'study', label: 'Study', color: 'bg-blue-500' },
    { value: 'explanation', label: 'Explanation', color: 'bg-purple-500' },
    { value: 'word_study', label: 'Word Study', color: 'bg-amber-500' },
    { value: 'application', label: 'Application', color: 'bg-green-500' },
    { value: 'sermon_notes', label: 'Sermon Notes', color: 'bg-red-500' },
    { value: 'devotional', label: 'Devotional', color: 'bg-pink-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Saved AI Content</h1>
          <p className="text-slate-300 mt-1">Your collection of AI-generated study materials</p>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-400">
          {savedContent.length} items saved
        </Badge>
      </div>

      {/* Content Organizer */}
      <ContentOrganizer 
        content={savedContent}
        onFilter={handleFilter}
        onSort={handleSort}
        onTagFilter={(tag) => setSelectedTag(tag)}
      />

      {/* Content Grid */}
      <div className="grid gap-4">
        {filteredContent.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/30 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={contentTypes.find(t => t.value === item.content_type)?.color}>
                        {contentTypes.find(t => t.value === item.content_type)?.label}
                      </Badge>
                      {item.scripture_reference && (
                        <Badge variant="outline" className="text-amber-400 border-amber-400">
                          {item.scripture_reference}
                        </Badge>
                      )}
                      {item.is_favorite && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                    </div>
                    <CardTitle className="text-xl text-slate-200">{item.title}</CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      Saved {format(new Date(item.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(item)}
                      className="h-8 w-8 text-slate-400 hover:text-yellow-400"
                    >
                      <Star className={`h-4 w-4 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyContent(item)}
                      className="h-8 w-8 text-slate-400 hover:text-blue-400"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContentMutation.mutate(item.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ReactMarkdown className="prose prose-invert prose-sm max-w-none text-slate-300">
                  {item.content}
                </ReactMarkdown>
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredContent.length === 0 && (
          <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
            <CardContent className="py-16 text-center">
              <BookmarkPlus className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No saved content yet</h3>
              <p className="text-slate-500">
                Start saving valuable insights from the AI Assistant by clicking the bookmark icon on messages
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}