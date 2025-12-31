import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, BookOpen, MessageSquare, Star, Mail, Award, Calendar, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileEmail, setProfileEmail] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    setProfileEmail(email);
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
      if (!profileEmail) {
        setProfileEmail(userData.email);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: profileUser } = useQuery({
    queryKey: ['user', profileEmail],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: profileEmail });
      return users[0] || null;
    },
    enabled: !!profileEmail
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['userPosts', profileEmail],
    queryFn: async () => {
      return await base44.entities.ForumPost.filter({ author_email: profileEmail }, '-created_date', 50);
    },
    enabled: !!profileEmail
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['userNotes', profileEmail],
    queryFn: async () => {
      if (currentUser?.email !== profileEmail) return [];
      return await base44.entities.Note.list('-created_date', 20);
    },
    enabled: !!profileEmail && currentUser?.email === profileEmail
  });

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.email === profileUser.email;
  const stats = {
    posts: posts.length,
    reputation: profileUser.reputation || 0,
    badges: (profileUser.badges || []).length
  };

  const badgeColors = {
    'Scholar': 'bg-purple-500',
    'Helpful': 'bg-green-500',
    'Teacher': 'bg-blue-500',
    'Contributor': 'bg-amber-500'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative">
                {profileUser.profile_picture_url ? (
                  <img 
                    src={profileUser.profile_picture_url} 
                    alt={profileUser.full_name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-amber-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-4 border-amber-500">
                    <User className="w-16 h-16 text-slate-400" />
                  </div>
                )}
                {stats.reputation >= 100 && (
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-2">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">{profileUser.full_name || profileUser.email}</h1>
                    <p className="text-slate-400">{profileUser.email}</p>
                  </div>
                  {isOwnProfile ? (
                    <Link to={createPageUrl('AISettings')}>
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <Link to={createPageUrl('Messages') + '?to=' + profileUser.email}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Mail className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  )}
                </div>

                {profileUser.bio && (
                  <p className="text-slate-300 leading-relaxed">{profileUser.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {profileUser.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profileUser.location}
                    </div>
                  )}
                  {profileUser.denomination && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {profileUser.denomination}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(profileUser.created_date), 'MMM yyyy')}
                  </div>
                </div>

                {profileUser.favorite_verse && (
                  <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-sm text-blue-300 font-medium mb-1">Favorite Verse:</p>
                    <p className="text-slate-300 italic">{profileUser.favorite_verse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageSquare className="h-5 w-5 text-amber-400" />
                  <span className="text-2xl font-bold text-white">{stats.posts}</span>
                </div>
                <p className="text-sm text-slate-400">Posts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">{stats.reputation}</span>
                </div>
                <p className="text-sm text-slate-400">Reputation</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{stats.badges}</span>
                </div>
                <p className="text-sm text-slate-400">Badges</p>
              </div>
            </div>

            {/* Badges */}
            {profileUser.badges && profileUser.badges.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Earned Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileUser.badges.map((badge, index) => (
                    <Badge key={index} className={`${badgeColors[badge] || 'bg-slate-600'} text-white px-3 py-1`}>
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/70">
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.map((post) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link to={createPageUrl('Forum')} className="text-lg font-semibold text-slate-200 hover:text-amber-400">
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                        <Badge className="bg-blue-500">{post.category}</Badge>
                        <span>•</span>
                        <span>{format(new Date(post.created_date), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{(post.replies || []).length} replies</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {posts.length === 0 && (
            <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No posts yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="notes" className="space-y-4">
            {notes.map((note) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">{note.title}</h3>
                    {note.verse_reference && (
                      <Badge variant="outline" className="text-amber-400 border-amber-400 mb-2">
                        {note.verse_reference}
                      </Badge>
                    )}
                    <p className="text-sm text-slate-400">
                      {format(new Date(note.created_date), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {notes.length === 0 && (
              <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No notes yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}