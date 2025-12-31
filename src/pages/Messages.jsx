import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Trash2, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const sent = await base44.entities.DirectMessage.filter({ sender_email: user.email });
      const received = await base44.entities.DirectMessage.filter({ recipient_email: user.email });
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.DirectMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setReplyContent('');
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.DirectMessage.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id) => base44.entities.DirectMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setSelectedConversation(null);
    }
  });

  const handleReply = () => {
    if (!replyContent.trim() || !selectedConversation) return;
    
    const recipient = selectedConversation.sender_email === user.email 
      ? { email: selectedConversation.recipient_email, name: selectedConversation.recipient_name }
      : { email: selectedConversation.sender_email, name: selectedConversation.sender_name };
    
    sendMessageMutation.mutate({
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      recipient_email: recipient.email,
      recipient_name: recipient.name,
      message: replyContent
    });
  };

  const getConversations = () => {
    const convMap = {};
    messages.forEach(msg => {
      const otherPerson = msg.sender_email === user.email ? msg.recipient_email : msg.sender_email;
      if (!convMap[otherPerson] || new Date(msg.created_date) > new Date(convMap[otherPerson].created_date)) {
        convMap[otherPerson] = msg;
      }
    });
    return Object.values(convMap);
  };

  const getMessagesWithPerson = (personEmail) => {
    return messages.filter(msg => 
      (msg.sender_email === user.email && msg.recipient_email === personEmail) ||
      (msg.recipient_email === user.email && msg.sender_email === personEmail)
    ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  };

  const conversations = getConversations();
  const unreadCount = messages.filter(msg => msg.recipient_email === user?.email && !msg.is_read).length;

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Messages
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-amber-600">{unreadCount} new</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-300px)]">
          {conversations.map((msg) => {
            const otherPerson = msg.sender_email === user.email 
              ? { email: msg.recipient_email, name: msg.recipient_name }
              : { email: msg.sender_email, name: msg.sender_name };
            const isUnread = msg.recipient_email === user.email && !msg.is_read;
            const isSelected = selectedConversation && (
              (selectedConversation.sender_email === msg.sender_email && selectedConversation.recipient_email === msg.recipient_email) ||
              (selectedConversation.sender_email === msg.recipient_email && selectedConversation.recipient_email === msg.sender_email)
            );
            
            return (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedConversation(msg);
                  if (isUnread) markReadMutation.mutate(msg.id);
                }}
                className={`w-full p-4 border-b border-slate-700 hover:bg-slate-800/50 text-left transition-colors ${
                  isSelected ? 'bg-slate-800' : ''
                } ${isUnread ? 'bg-amber-900/20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold text-sm ${isUnread ? 'text-amber-400' : 'text-slate-200'}`}>
                        {otherPerson.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(msg.created_date), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{msg.message}</p>
                  </div>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No messages yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="md:col-span-2 bg-slate-900/70 backdrop-blur-sm border-slate-700 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-200">
                  {selectedConversation.sender_email === user.email 
                    ? selectedConversation.recipient_name 
                    : selectedConversation.sender_name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Delete this conversation?')) {
                      const personEmail = selectedConversation.sender_email === user.email 
                        ? selectedConversation.recipient_email 
                        : selectedConversation.sender_email;
                      const toDelete = getMessagesWithPerson(personEmail);
                      toDelete.forEach(msg => deleteMessageMutation.mutate(msg.id));
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {getMessagesWithPerson(
                selectedConversation.sender_email === user.email 
                  ? selectedConversation.recipient_email 
                  : selectedConversation.sender_email
              ).map((msg) => {
                const isSent = msg.sender_email === user.email;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      isSent 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-slate-800 text-slate-200'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isSent ? 'text-amber-200' : 'text-slate-500'}`}>
                        {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
                <Button onClick={handleReply} className="bg-amber-600 hover:bg-amber-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}