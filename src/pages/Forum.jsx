import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Heart, Pin, Send, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export default function Forum() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'discussion',
    scripture_reference: '',
    tags: []
  });
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

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-updated_date', 100),
    enabled: !!user
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPosts']);
      setShowNewPost(false);
      setNewPost({ title: '', content: '', category: 'discussion', scripture_reference: '', tags: [] });
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ForumPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPosts']);
    }
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    createPostMutation.mutate({
      ...newPost,
      author_name: user.full_name || user.email,
      author_email: user.email,
      replies: [],
      likes: []
    });
  };

  const handleLike = (post) => {
    const likes = post.likes || [];
    const newLikes = likes.includes(user.email)
      ? likes.filter(email => email !== user.email)
      : [...likes, user.email];
    
    updatePostMutation.mutate({
      id: post.id,
      data: { likes: newLikes }
    });
  };

  const handleReply = (post) => {
    if (!replyContent.trim()) return;
    
    const newReply = {
      author_name: user.full_name || user.email,
      author_email: user.email,
      content: replyContent,
      timestamp: new Date().toISOString()
    };
    
    updatePostMutation.mutate({
      id: post.id,
      data: {
        replies: [...(post.replies || []), newReply]
      }
    });
    
    setReplyContent('');
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Posts', color: 'bg-slate-500' },
    { value: 'bible_study', label: 'Bible Study', color: 'bg-blue-500' },
    { value: 'theology', label: 'Theology', color: 'bg-purple-500' },
    { value: 'prayer_requests', label: 'Prayer Requests', color: 'bg-green-500' },
    { value: 'testimonies', label: 'Testimonies', color: 'bg-amber-500' },
    { value: 'questions', label: 'Questions', color: 'bg-red-500' },
    { value: 'discussion', label: 'Discussion', color: 'bg-cyan-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Community Forum</h1>
          <p className="text-slate-300 mt-1">Connect, share, and grow together in faith</p>
        </div>
        <Button onClick={() => setShowNewPost(!showNewPost)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* New Post Form */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-slate-900/70 backdrop-blur-sm border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-slate-200">Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
                <Textarea
                  placeholder="Share your thoughts, questions, or insights..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-slate-200 min-h-[120px]"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.value !== 'all').map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Scripture Reference (optional)"
                    value={newPost.scripture_reference}
                    onChange={(e) => setNewPost({...newPost, scripture_reference: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
                  <Button onClick={handleCreatePost} className="bg-amber-600 hover:bg-amber-700">Post</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full md:w-auto">
                {categories.map(cat => (
                  <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                    {cat.label.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/30 transition-all">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && <Pin className="h-4 w-4 text-amber-400" />}
                        <Badge className={categories.find(c => c.value === post.category)?.color}>
                          {categories.find(c => c.value === post.category)?.label}
                        </Badge>
                        {post.scripture_reference && (
                          <Badge variant="outline" className="text-amber-400 border-amber-400">
                            {post.scripture_reference}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-200 mb-2">{post.title}</h3>
                      <p className="text-sm text-slate-400">
                        Posted by {post.author_name} • {format(new Date(post.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-slate-300 leading-relaxed">
                    {post.content.length > 300 && !selectedPost?.id === post.id ? (
                      <>
                        {post.content.substring(0, 300)}...
                        <Button
                          variant="link"
                          onClick={() => setSelectedPost(post)}
                          className="text-amber-400 p-0 h-auto ml-2"
                        >
                          Read more
                        </Button>
                      </>
                    ) : (
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                        {post.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post)}
                      className={`${(post.likes || []).includes(user?.email) ? 'text-red-400' : 'text-slate-400'}`}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {(post.likes || []).length}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                      className="text-slate-400"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {(post.replies || []).length}
                    </Button>
                  </div>

                  {/* Replies Section */}
                  {selectedPost?.id === post.id && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-amber-500/30">
                      {(post.replies || []).map((reply, idx) => (
                        <div key={idx} className="bg-slate-800/50 p-3 rounded-lg">
                          <p className="text-xs text-slate-400 mb-2">
                            {reply.author_name} • {format(new Date(reply.timestamp), 'MMM d, h:mm a')}
                          </p>
                          <p className="text-sm text-slate-300">{reply.content}</p>
                        </div>
                      ))}

                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleReply(post)}
                          className="bg-slate-800 border-slate-700 text-slate-200"
                        />
                        <Button onClick={() => handleReply(post)} size="icon" className="bg-amber-600 hover:bg-amber-700">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredPosts.length === 0 && (
          <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No posts yet</h3>
              <p className="text-slate-500">Be the first to start a conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}