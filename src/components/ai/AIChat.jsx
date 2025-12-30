import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const AI_PROVIDERS = [
  { id: 'chatgpt', name: 'ChatGPT', color: 'bg-green-500' },
  { id: 'claude', name: 'Claude', color: 'bg-purple-500' },
  { id: 'copilot', name: 'Copilot', color: 'bg-blue-500' },
  { id: 'grok', name: 'Grok', color: 'bg-orange-500' },
  { id: 'gemini', name: 'Gemini', color: 'bg-cyan-500' }
];

export default function AIChat({ conversation, onUpdate }) {
  const [messages, setMessages] = useState(conversation?.messages || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(conversation?.current_provider || 'chatgpt');
  const [showProviderSwitch, setShowProviderSwitch] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      // Build context from conversation
      const conversationContext = newMessages
        .slice(-10)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      // First, check for mental health concerns and offensive content
      const safetyCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this message for:
1. Signs of depression, suicidal ideation, or self-harm
2. Offensive, hateful, or inappropriate content

User message: "${input}"

Respond with your analysis.`,
        response_json_schema: {
          type: "object",
          properties: {
            has_mental_health_concern: { type: "boolean" },
            has_offensive_content: { type: "boolean" },
            concern_level: { type: "string", enum: ["none", "mild", "moderate", "severe"] }
          }
        }
      });

      // Handle mental health concerns
      if (safetyCheck.has_mental_health_concern && safetyCheck.concern_level === "severe") {
        const crisisResponse = {
          role: 'assistant',
          content: `I'm truly concerned about what you're sharing. Please know that you're not alone, and help is available right now.

**National Suicide Prevention Lifeline:**
📞 Call or text: **988**
Available 24/7 for free, confidential support

**Crisis Text Line:**
📱 Text HOME to **741741**

**International Association for Suicide Prevention:**
🌍 Visit: https://www.iasp.info/resources/Crisis_Centres/

You matter, and there are people who care and want to help. Please reach out to one of these resources - they're trained to support you through this difficult time.

If you're in immediate danger, please call 911 or go to your nearest emergency room.

I'm here to chat, but these professionals are specifically trained to help in crisis situations. Would you like to talk about something else, or would you prefer some encouraging Scripture passages?`,
          provider: currentProvider,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [...newMessages, crisisResponse];
        setMessages(updatedMessages);
        
        if (onUpdate) {
          onUpdate({
            messages: updatedMessages,
            current_provider: currentProvider
          });
        }
        setLoading(false);
        return;
      }

      // Handle offensive content
      if (safetyCheck.has_offensive_content) {
        const warningResponse = {
          role: 'assistant',
          content: `I'm here to provide helpful, respectful conversation. Let's keep our discussion positive and constructive. How can I assist you with your studies, projects, or other questions?`,
          provider: currentProvider,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [...newMessages, warningResponse];
        setMessages(updatedMessages);
        
        if (onUpdate) {
          onUpdate({
            messages: updatedMessages,
            current_provider: currentProvider
          });
        }
        setLoading(false);
        return;
      }

      const prompt = `You are a helpful, friendly AI assistant for Alpha Omega Team, a Christian educational platform.

IMPORTANT GUIDELINES:
- You can discuss any topic (Bible study, homework help, general questions, projects, etc.)
- Always be respectful, encouraging, and constructive
- Keep responses clean and family-friendly
- Be conversational and helpful
- If asked about faith topics, be thoughtful and biblically grounded
- For general questions, provide clear and helpful information

Previous conversation context:
${conversationContext}

Respond naturally and helpfully to the user's message.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
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
        provider: currentProvider,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update conversation in database
      if (onUpdate) {
        onUpdate({
          messages: updatedMessages,
          current_provider: currentProvider
        });
      }

      // Check if we need to rotate provider (simulating free tier limits)
      if (updatedMessages.length > 0 && updatedMessages.length % 15 === 0) {
        setShowProviderSwitch(true);
        rotateProvider();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // If error, try switching provider automatically
      setShowProviderSwitch(true);
      rotateProvider();
      
      const errorMessage = {
        role: 'assistant',
        content: 'I encountered an issue. Switching to another AI provider to continue our conversation...',
        provider: currentProvider,
        timestamp: new Date().toISOString()
      };
      setMessages([...newMessages, errorMessage]);
    }

    setLoading(false);
  };

  const rotateProvider = () => {
    const providers = AI_PROVIDERS.map(p => p.id);
    const currentIndex = providers.indexOf(currentProvider);
    const nextIndex = (currentIndex + 1) % providers.length;
    const nextProvider = providers[nextIndex];
    
    setCurrentProvider(nextProvider);
    
    // Show notification
    setTimeout(() => {
      setShowProviderSwitch(false);
    }, 3000);
  };

  const getCurrentProviderInfo = () => {
    return AI_PROVIDERS.find(p => p.id === currentProvider) || AI_PROVIDERS[0];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header with Provider Info */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 mb-4">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Bot className="h-5 w-5 text-amber-400" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getCurrentProviderInfo().color} text-white`}>
                <Sparkles className="h-3 w-3 mr-1" />
                {getCurrentProviderInfo().name}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={rotateProvider}
                className="h-8 w-8 text-slate-400 hover:text-amber-400"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Provider Switch Notification */}
      <AnimatePresence>
        {showProviderSwitch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Card className="bg-amber-500/20 border-amber-500/50">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-200">
                  Switching to {getCurrentProviderInfo().name} to continue uninterrupted service...
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <Card className="flex-1 bg-slate-900/70 backdrop-blur-sm border-slate-700 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="p-4 bg-amber-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Start a Conversation</h3>
                <p className="text-slate-400">Ask me about Bible study, theology, or get help with your projects</p>
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
                    <Bot className="h-5 w-5 text-white" />
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
                  
                  {message.provider && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-slate-500">
                        via {AI_PROVIDERS.find(p => p.id === message.provider)?.name}
                      </span>
                    </div>
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
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200" />
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
              placeholder="Ask me anything about Bible study, theology, or your projects..."
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
            Press Enter to send, Shift+Enter for new line • Using {getCurrentProviderInfo().name}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}