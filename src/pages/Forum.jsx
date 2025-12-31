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
import { MessageSquare, ArrowUp, ArrowDown, Pin, Send, Search, Plus, Trash2, User as UserIcon, ThumbsUp, ThumbsDown, Mail, Pencil } from 'lucide-react';
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
  const [replyToId, setReplyToId] = useState(null);
  const [sortBy, setSortBy] = useState('hot');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'discussion',
    scripture_reference: '',
    tags: []
  });
  const [messageRecipient, setMessageRecipient] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState({ title: '', content: '' });
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      // User not authenticated
      setUser(null);
    }
  };

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: async () => {
      try {
        return await base44.entities.ForumPost.list('-updated_date', 100);
      } catch (error) {
        console.error('Error loading posts:', error);
        return [];
      }
    },
    enabled: true,
    retry: false
  });

  useEffect(() => {
    // Check for verse parameter in URL and find or create discussion
    if (!isLoading && posts.length >= 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const verse = urlParams.get('verse');
      const verseText = urlParams.get('verseText');
      
      if (verse && verseText) {
        // Look for existing post with this scripture reference
        const existingPost = posts.find(p => p.scripture_reference === verse);
        
        if (existingPost) {
          // Open existing post
          setSelectedPost(existingPost);
          setShowNewPost(false);
        } else {
          // Show new post form pre-filled
          setShowNewPost(true);
          setNewPost({
            title: `Discussion: ${verse}`,
            content: `"${verseText}"\n\nWhat are your thoughts on this verse?`,
            category: 'bible_study',
            scripture_reference: verse,
            tags: []
          });
        }
        
        // Clear URL parameters after processing
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [posts, isLoading]);

  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      const newPost = await base44.entities.ForumPost.create(data);
      
      // Send email notification to admin
      try {
        await base44.integrations.Core.SendEmail({
          to: 'alphaomega247help@gmail.com',
          subject: `New Forum Post: ${data.title}`,
          body: `
            A new post has been created in the Alpha Omega community forum.
            
            Title: ${data.title}
            Category: ${data.category}
            Author: ${data.author_name}
            ${data.scripture_reference ? `Scripture: ${data.scripture_reference}` : ''}
            
            Content:
            ${data.content}
            
            View and moderate: ${window.location.origin}${window.location.pathname}
          `
        });
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
      
      return newPost;
    },
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

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.ForumPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPosts']);
      setSelectedPost(null);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.DirectMessage.create(data),
    onSuccess: () => {
      setShowMessageDialog(false);
      setMessageContent('');
      setMessageRecipient(null);
      alert('Message sent!');
    }
  });

  const handleSendMessage = () => {
    if (!user) {
      alert('Please sign in to send messages');
      return;
    }
    if (!messageContent.trim()) return;
    
    sendMessageMutation.mutate({
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      recipient_email: messageRecipient.email,
      recipient_name: messageRecipient.name,
      message: messageContent
    });
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditedContent({ title: post.title, content: post.content });
  };

  const handleSaveEdit = async () => {
    if (!editedContent.title.trim() || !editedContent.content.trim()) return;
    
    await updatePostMutation.mutateAsync({
      id: editingPost.id,
      data: { 
        title: editedContent.title, 
        content: editedContent.content 
      }
    });
    
    setEditingPost(null);
    setEditedContent({ title: '', content: '' });
  };

  const handleReputation = async (post, reputationType) => {
    if (!user) {
      alert('Please sign in to give reputation');
      return;
    }
    
    const reputation = post.reputation || { thumbs_up: [], thumbs_down: [] };
    let newThumbsUp = [...(reputation.thumbs_up || [])];
    let newThumbsDown = [...(reputation.thumbs_down || [])];
    let reputationChange = 0;
    
    if (reputationType === 'up') {
      if (newThumbsUp.includes(user.email)) {
        newThumbsUp = newThumbsUp.filter(email => email !== user.email);
        reputationChange = -1;
      } else {
        newThumbsUp.push(user.email);
        newThumbsDown = newThumbsDown.filter(email => email !== user.email);
        reputationChange = newThumbsDown.includes(user.email) ? 2 : 1;
      }
    } else {
      if (newThumbsDown.includes(user.email)) {
        newThumbsDown = newThumbsDown.filter(email => email !== user.email);
        reputationChange = 1;
      } else {
        newThumbsDown.push(user.email);
        newThumbsUp = newThumbsUp.filter(email => email !== user.email);
        reputationChange = newThumbsUp.includes(user.email) ? -2 : -1;
      }
    }
    
    await updatePostMutation.mutateAsync({
      id: post.id,
      data: { reputation: { thumbs_up: newThumbsUp, thumbs_down: newThumbsDown } }
    });
    
    // Update author's reputation
    try {
      const authorResults = await base44.entities.User.filter({ email: post.author_email });
      if (authorResults.length > 0) {
        const author = authorResults[0];
        const currentRep = author.reputation || 0;
        await base44.entities.User.update(author.id, {
          reputation: currentRep + reputationChange
        });
      }
    } catch (error) {
      console.error('Error updating reputation:', error);
    }
  };

  const handleCreatePost = () => {
    if (!user) {
      alert('Please sign in to create a post');
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    createPostMutation.mutate({
      ...newPost,
      author_name: user.full_name || user.email,
      author_email: user.email,
      author_profile_picture: user.profile_picture_url || null,
      replies: [],
      upvotes: [],
      downvotes: []
    });
  };

  const getScore = (post) => {
    const upvotes = (post.upvotes || []).length;
    const downvotes = (post.downvotes || []).length;
    return upvotes - downvotes;
  };

  const handleVote = (post, voteType) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }
    const upvotes = post.upvotes || [];
    const downvotes = post.downvotes || [];
    
    let newUpvotes = [...upvotes];
    let newDownvotes = [...downvotes];
    
    if (voteType === 'up') {
      if (upvotes.includes(user.email)) {
        newUpvotes = upvotes.filter(email => email !== user.email);
      } else {
        newUpvotes = [...upvotes, user.email];
        newDownvotes = downvotes.filter(email => email !== user.email);
      }
    } else {
      if (downvotes.includes(user.email)) {
        newDownvotes = downvotes.filter(email => email !== user.email);
      } else {
        newDownvotes = [...downvotes, user.email];
        newUpvotes = upvotes.filter(email => email !== user.email);
      }
    }
    
    updatePostMutation.mutate({
      id: post.id,
      data: { upvotes: newUpvotes, downvotes: newDownvotes }
    });
  };

  const handleReply = (post) => {
    if (!user) {
      alert('Please sign in to reply');
      return;
    }
    if (!replyContent.trim()) return;
    
    const newReply = {
      id: Date.now().toString(),
      author_name: user.full_name || user.email,
      author_email: user.email,
      author_profile_picture: user.profile_picture_url || null,
      content: replyContent,
      timestamp: new Date().toISOString(),
      upvotes: [],
      downvotes: [],
      parent_reply_id: replyToId
    };
    
    updatePostMutation.mutate({
      id: post.id,
      data: {
        replies: [...(post.replies || []), newReply]
      }
    });
    
    setReplyContent('');
    setReplyToId(null);
  };

  const handleReplyVote = (post, replyId, voteType) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }
    const replies = post.replies || [];
    const updatedReplies = replies.map(reply => {
      if (reply.id !== replyId) return reply;
      
      const upvotes = reply.upvotes || [];
      const downvotes = reply.downvotes || [];
      let newUpvotes = [...upvotes];
      let newDownvotes = [...downvotes];
      
      if (voteType === 'up') {
        if (upvotes.includes(user.email)) {
          newUpvotes = upvotes.filter(email => email !== user.email);
        } else {
          newUpvotes = [...upvotes, user.email];
          newDownvotes = downvotes.filter(email => email !== user.email);
        }
      } else {
        if (downvotes.includes(user.email)) {
          newDownvotes = downvotes.filter(email => email !== user.email);
        } else {
          newDownvotes = [...downvotes, user.email];
          newUpvotes = upvotes.filter(email => email !== user.email);
        }
      }
      
      return { ...reply, upvotes: newUpvotes, downvotes: newDownvotes };
    });
    
    updatePostMutation.mutate({
      id: post.id,
      data: { replies: updatedReplies }
    });
  };

  const sortPosts = (posts) => {
    const sorted = [...posts];
    switch (sortBy) {
      case 'hot':
        return sorted.sort((a, b) => {
          const scoreA = getScore(a);
          const scoreB = getScore(b);
          const timeA = new Date(a.created_date).getTime();
          const timeB = new Date(b.created_date).getTime();
          const hotA = scoreA / Math.pow((Date.now() - timeA) / 3600000 + 2, 1.5);
          const hotB = scoreB / Math.pow((Date.now() - timeB) / 3600000 + 2, 1.5);
          return hotB - hotA;
        });
      case 'new':
        return sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      case 'top':
        return sorted.sort((a, b) => getScore(b) - getScore(a));
      default:
        return sorted;
    }
  };

  const filteredPosts = sortPosts(posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }));

  const renderReplies = (replies, post, parentId = null, depth = 0) => {
    const filteredReplies = replies.filter(r => r.parent_reply_id === parentId);
    
    return filteredReplies.map((reply) => {
      const replyScore = (reply.upvotes || []).length - (reply.downvotes || []).length;
      const hasUpvoted = (reply.upvotes || []).includes(user?.email);
      const hasDownvoted = (reply.downvotes || []).includes(user?.email);
      const childReplies = replies.filter(r => r.parent_reply_id === reply.id);
      
      return (
        <div key={reply.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-3'}`}>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex gap-2">
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${hasUpvoted ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'}`}
                  onClick={() => handleReplyVote(post, reply.id, 'up')}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className={`text-xs font-bold ${replyScore > 0 ? 'text-orange-500' : replyScore < 0 ? 'text-blue-500' : 'text-slate-400'}`}>
                  {replyScore}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${hasDownvoted ? 'text-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
                  onClick={() => handleReplyVote(post, reply.id, 'down')}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  {reply.author_profile_picture ? (
                    <img src={reply.author_profile_picture} alt={reply.author_name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                  <span>{reply.author_name} • {format(new Date(reply.timestamp), 'MMM d, h:mm a')}</span>
                </div>
                <p className="text-sm text-slate-300">{reply.content}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-amber-400 p-0 h-auto mt-1"
                  onClick={() => setReplyToId(reply.id)}
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
          {childReplies.length > 0 && (
            <div className="border-l-2 border-slate-700 pl-2">
              {renderReplies(replies, post, reply.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

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

      {/* Search, Filter, and Sort */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-32 bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="new">🆕 New</SelectItem>
                  <SelectItem value="top">⭐ Top</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full">
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

      {/* Message Dialog */}
      {showMessageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMessageDialog(false)}>
          <Card className="bg-slate-900 border-slate-700 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-slate-200">Send Message to {messageRecipient?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 min-h-[120px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
                <Button onClick={handleSendMessage} className="bg-amber-600 hover:bg-amber-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const score = getScore(post);
          const hasUpvoted = (post.upvotes || []).includes(user?.email);
          const hasDownvoted = (post.downvotes || []).includes(user?.email);
          
          return (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${hasUpvoted ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'}`}
                        onClick={() => handleVote(post, 'up')}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className={`text-sm font-bold ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-slate-400'}`}>
                        {score}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${hasDownvoted ? 'text-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
                        onClick={() => handleVote(post, 'down')}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 space-y-4">
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
                          <h3 className="text-xl font-semibold text-slate-200 mb-2 cursor-pointer hover:text-amber-400" onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}>
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            {post.author_profile_picture ? (
                              <img src={post.author_profile_picture} alt={post.author_name} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                <UserIcon className="w-3 h-3 text-slate-400" />
                              </div>
                            )}
                            <span>Posted by {post.author_name} • {format(new Date(post.created_date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReputation(post, 'up')}
                                className={`h-7 ${(post.reputation?.thumbs_up || []).includes(user?.email) ? 'text-green-500' : 'text-slate-500 hover:text-green-500'}`}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {(post.reputation?.thumbs_up || []).length}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReputation(post, 'down')}
                                className={`h-7 ${(post.reputation?.thumbs_down || []).includes(user?.email) ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                              >
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                {(post.reputation?.thumbs_down || []).length}
                              </Button>
                            </div>
                            {user && user.email !== post.author_email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMessageRecipient({ email: post.author_email, name: post.author_name });
                                  setShowMessageDialog(true);
                                }}
                                className="h-7 text-slate-500 hover:text-amber-400"
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Message
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {user?.email === post.author_email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPost(post)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {user?.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Delete this post? This action cannot be undone.')) {
                                  deletePostMutation.mutate(post.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        </div>

                      {/* Post Content */}
                      {editingPost?.id === post.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editedContent.title}
                            onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            placeholder="Post title"
                          />
                          <Textarea
                            value={editedContent.content}
                            onChange={(e) => setEditedContent({ ...editedContent, content: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-slate-200 min-h-[120px]"
                            placeholder="Post content"
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleSaveEdit} className="bg-amber-600 hover:bg-amber-700">
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setEditingPost(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-300 leading-relaxed">
                          {post.content.length > 300 && selectedPost?.id !== post.id ? (
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
                      )}

                      {/* Discussion Prompts */}
                      {post.category === 'bible_study' && selectedPost?.id === post.id && (
                        <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                          <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Discussion Prompts</h4>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                            <li>What is the main message or theme of this passage?</li>
                            <li>How does this verse apply to your life today?</li>
                            <li>What questions does this raise for you?</li>
                            <li>How does this connect to other parts of Scripture?</li>
                            <li>What action steps can you take based on this verse?</li>
                          </ul>
                        </div>
                      )}
                      {post.category === 'theology' && selectedPost?.id === post.id && (
                        <div className="mt-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                          <h4 className="text-sm font-semibold text-purple-300 mb-2">🧠 Theological Discussion Points</h4>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                            <li>What does this reveal about God's character?</li>
                            <li>How does this align with core Christian doctrine?</li>
                            <li>What are different theological perspectives on this?</li>
                            <li>How has church history interpreted this?</li>
                          </ul>
                        </div>
                      )}
                      {post.category === 'prayer_requests' && selectedPost?.id === post.id && (
                        <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                          <h4 className="text-sm font-semibold text-green-300 mb-2">🙏 Prayer Guidelines</h4>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                            <li>Pray specifically and compassionately</li>
                            <li>Share relevant Scripture verses for encouragement</li>
                            <li>Follow up with updates when possible</li>
                            <li>Maintain confidentiality and respect</li>
                          </ul>
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                          className="text-slate-400 hover:text-amber-400"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {(post.replies || []).length} comments
                        </Button>
                      </div>

                      {/* Replies Section */}
                      {selectedPost?.id === post.id && (
                        <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder={replyToId ? "Write a reply to comment..." : "Write a comment..."}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleReply(post)}
                              className="bg-slate-800 border-slate-700 text-slate-200"
                            />
                            <Button onClick={() => handleReply(post)} size="icon" className="bg-amber-600 hover:bg-amber-700">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                          {replyToId && (
                            <Button variant="ghost" size="sm" onClick={() => setReplyToId(null)} className="text-xs text-slate-500">
                              Cancel reply
                            </Button>
                          )}
                          {renderReplies(post.replies || [], post)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

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