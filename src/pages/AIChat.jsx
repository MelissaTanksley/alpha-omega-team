import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AIChat from '../components/ai/AIChat';
import LoginModal from '../components/auth/LoginModal';
import { Plus, MessageSquare, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function AIChatPage() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
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

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => base44.entities.AIConversation.filter({ created_by: user.email }, '-updated_date'),
    enabled: !!user
  });

  const createConversationMutation = useMutation({
    mutationFn: (data) => base44.entities.AIConversation.create(data),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries(['conversations']);
      setSelectedConversation(newConv);
      setShowNewChat(false);
      setNewChatTitle('');
    }
  });

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIConversation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
    }
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id) => base44.entities.AIConversation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      if (selectedConversation?.id === deleteConversationMutation.variables) {
        setSelectedConversation(null);
      }
    }
  });

  const handleCreateConversation = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!newChatTitle.trim()) {
      setNewChatTitle('New Conversation');
    }
    createConversationMutation.mutate({
      title: newChatTitle.trim() || 'New Conversation',
      messages: [],
      current_provider: 'chatgpt',
      provider_rotation: [
        'chatgpt',
        'claude',
        'llama',
        'gemini',
        'perplexity',
        'synthesia',
        'elevenlabs',
        'grok',
        'mistral',
        'copyai',
        'midjourney',
        'firefly',
        'copilot',
        'runway',
        'mm1',
        'huggingface',
        'gamma',
        'pika',
        'jasper',
        'techpresso',
        'deepseek'
      ]
    });
  };

  const handleUpdateConversation = (updates) => {
    if (selectedConversation) {
      updateConversationMutation.mutate({
        id: selectedConversation.id,
        data: updates
      });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        action="save your conversations and chat with AI"
      />
      
      {/* Sidebar - Hidden when conversation is selected */}
      {!selectedConversation && (
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-200 flex items-center justify-between">
              <span>Conversations</span>
              <Button 
                size="icon" 
                onClick={() => setShowNewChat(!showNewChat)}
                className="h-8 w-8 bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {showNewChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pb-2 border-b border-slate-700"
              >
                <Input
                  placeholder="Conversation title..."
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateConversation()}
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
                <Button 
                  onClick={handleCreateConversation}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  Create
                </Button>
              </motion.div>
            )}

            <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  whileHover={{ x: 2 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedConversation?.id === conv.id
                      ? 'bg-amber-600/20 border border-amber-600/50'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        <h4 className="text-sm font-medium text-slate-200 truncate">{conv.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {conv.messages?.length || 0} messages
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {conv.updated_date && format(new Date(conv.updated_date), 'MMM d')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversationMutation.mutate(conv.id);
                      }}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {conversations.length === 0 && !showNewChat && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No conversations yet.<br />Click + to start chatting!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Chat Area */}
      {selectedConversation && (
        <div className="h-full">
          <AIChat 
            conversation={selectedConversation} 
            onUpdate={handleUpdateConversation}
          />
        </div>
      )}
    </div>
  );
}