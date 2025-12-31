import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, BookOpen, User, Sparkles, Loader2, BookMarked } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function BibleAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    loadUserContext();
  }, []);

  const loadUserContext = async () => {
    try {
      const user = await base44.auth.me();
      const progress = await base44.entities.UserBibleProgress.filter({ created_by: user.email });
      setUserContext({
        progress: progress[0],
        userName: user.full_name
      });
    } catch (error) {
      console.error('Error loading context:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const conversationContext = newMessages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      let contextInfo = '';
      if (userContext?.progress) {
        contextInfo = `\n\nUSER'S BIBLE READING PROGRESS:
- Currently reading: ${userContext.progress.current_book} ${userContext.progress.current_chapter}:${userContext.progress.current_verse}
- Preferred translation: ${userContext.progress.preferred_translation || 'KJV'}
- Total verses read: ${userContext.progress.verses_read || 0}`;
      }

      const prompt = `You are a knowledgeable Bible study assistant with deep theological understanding. Your role is to help users understand Scripture, answer biblical questions, and provide insights.

GUIDELINES:
- Provide biblically-grounded, theologically sound responses
- Include relevant Scripture references when appropriate
- Explain Hebrew/Greek meanings when relevant
- Offer historical and cultural context
- Be respectful of different theological perspectives
- Keep responses clear and educational
${contextInfo}

Previous conversation:
${conversationContext}

Respond to the user's question with biblical insight and accuracy.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }
          }
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      setMessages([...newMessages, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I encountered an issue. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages([...newMessages, errorMessage]);
    }

    setLoading(false);
  };

  const quickQuestions = [
    "Explain the context of this verse",
    "What does this passage mean?",
    "Show me related verses",
    "What's the original Greek/Hebrew meaning?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-amber-500/30 mb-4">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  AI Bible Assistant
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Ask questions about Scripture, theology, and biblical interpretation</p>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 bg-slate-900/70 backdrop-blur-sm border-slate-700 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-6">
                <div className="p-4 bg-amber-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Ask Your Bible Questions</h3>
                  <p className="text-slate-400 mb-6">Get insights on Scripture, theology, and biblical interpretation</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {quickQuestions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => setInput(q)}
                      className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-amber-400 text-left justify-start"
                    >
                      <BookMarked className="h-4 w-4 mr-2 flex-shrink-0" />
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <div className="flex gap-2 items-center">
                    <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                    <span className="text-sm text-slate-400">Searching Scripture and theology...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Input */}
      <Card className="mt-4 bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about any Bible verse, theological concept, or biblical question..."
              className="min-h-[60px] bg-slate-800 border-slate-700 text-slate-200 resize-none"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-amber-600 hover:bg-amber-700 h-auto px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>
    </div>
  );
}