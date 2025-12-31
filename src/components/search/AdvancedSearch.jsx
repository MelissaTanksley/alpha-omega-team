import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, MessageSquare, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [dateRange, setDateRange] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ['search', query, searchType, category, sortBy, dateRange],
    queryFn: async () => {
      if (!query.trim()) return { posts: [], notes: [], users: [] };

      const searchLower = query.toLowerCase();
      const results = { posts: [], notes: [], users: [] };

      // Search posts
      if (searchType === 'all' || searchType === 'posts') {
        const allPosts = await base44.entities.ForumPost.list('-created_date', 200);
        results.posts = allPosts.filter(post => {
          const matchesQuery = 
            post.title?.toLowerCase().includes(searchLower) ||
            post.content?.toLowerCase().includes(searchLower) ||
            post.scripture_reference?.toLowerCase().includes(searchLower);
          const matchesCategory = category === 'all' || post.category === category;
          return matchesQuery && matchesCategory;
        });
      }

      // Search notes (only user's own)
      if (searchType === 'all' || searchType === 'notes') {
        try {
          const allNotes = await base44.entities.Note.list('-created_date', 200);
          results.notes = allNotes.filter(note =>
            note.title?.toLowerCase().includes(searchLower) ||
            note.content?.toLowerCase().includes(searchLower) ||
            note.verse_reference?.toLowerCase().includes(searchLower)
          );
        } catch (error) {
          // User not logged in or no access
          results.notes = [];
        }
      }

      // Search users
      if (searchType === 'all' || searchType === 'users') {
        const allUsers = await base44.entities.User.list('-created_date', 100);
        results.users = allUsers.filter(user =>
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.bio?.toLowerCase().includes(searchLower)
        );
      }

      // Apply date filtering
      if (dateRange !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        if (dateRange === 'day') filterDate.setDate(now.getDate() - 1);
        if (dateRange === 'week') filterDate.setDate(now.getDate() - 7);
        if (dateRange === 'month') filterDate.setMonth(now.getMonth() - 1);
        if (dateRange === 'year') filterDate.setFullYear(now.getFullYear() - 1);

        results.posts = results.posts.filter(p => new Date(p.created_date) >= filterDate);
        results.notes = results.notes.filter(n => new Date(n.created_date) >= filterDate);
      }

      // Apply sorting
      const sortFn = (a, b) => {
        if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
        if (sortBy === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
        return 0; // relevance - already filtered by match
      };

      results.posts.sort(sortFn);
      results.notes.sort(sortFn);

      return results;
    },
    enabled: false
  });

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
      refetch();
    }
  };

  const totalResults = results 
    ? results.posts.length + results.notes.length + results.users.length 
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Search className="h-10 w-10 text-amber-400" />
          Advanced Search
        </h1>
        <p className="text-slate-300 text-lg">Search across posts, notes, and members</p>
      </div>

      {/* Search Controls */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Search for posts, notes, users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-slate-800 border-slate-700 text-slate-200 flex-1"
            />
            <Button onClick={handleSearch} disabled={!query.trim()} className="bg-amber-600 hover:bg-amber-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
                <SelectItem value="notes">Notes</SelectItem>
                <SelectItem value="users">Users</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bible_study">Bible Study</SelectItem>
                <SelectItem value="theology">Theology</SelectItem>
                <SelectItem value="prayer_requests">Prayer</SelectItem>
                <SelectItem value="testimonies">Testimonies</SelectItem>
                <SelectItem value="questions">Questions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">
              {isLoading ? 'Searching...' : `${totalResults} Results Found`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
              </div>
            ) : totalResults > 0 ? (
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                  <TabsTrigger value="posts">
                    Posts ({results.posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="notes">
                    Notes ({results.notes.length})
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    Users ({results.users.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-3 mt-4">
                  {results.posts.map(post => (
                    <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link to={createPageUrl('Forum')}>
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-200 hover:text-amber-400">
                                  {post.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <Badge className="bg-blue-500">{post.category}</Badge>
                                  <span className="text-slate-400">by {post.author_name}</span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-slate-500">
                                    {format(new Date(post.created_date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                              <MessageSquare className="h-5 w-5 text-slate-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="notes" className="space-y-3 mt-4">
                  {results.notes.map(note => (
                    <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link to={createPageUrl('Notes')}>
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-200 hover:text-amber-400">
                                  {note.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  {note.verse_reference && (
                                    <Badge variant="outline" className="text-amber-400 border-amber-400">
                                      {note.verse_reference}
                                    </Badge>
                                  )}
                                  <span className="text-slate-500">
                                    {format(new Date(note.created_date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                              <BookOpen className="h-5 w-5 text-slate-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="users" className="space-y-3 mt-4">
                  {results.users.map(user => (
                    <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link to={createPageUrl('UserProfile') + '?email=' + user.email}>
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              {user.profile_picture_url ? (
                                <img 
                                  src={user.profile_picture_url} 
                                  alt={user.full_name} 
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                  <User className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-200 hover:text-amber-400">
                                  {user.full_name || user.email}
                                </h3>
                                {user.bio && (
                                  <p className="text-sm text-slate-400 mt-1 line-clamp-1">{user.bio}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                  <span>⭐ {user.reputation || 0}</span>
                                  <span>•</span>
                                  <span>Joined {format(new Date(user.created_date), 'MMM yyyy')}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No results found for "{query}"</p>
                <p className="text-sm text-slate-500 mt-2">Try different keywords or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}