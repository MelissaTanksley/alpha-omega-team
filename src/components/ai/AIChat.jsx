import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, RefreshCw, AlertCircle, Save, BookmarkPlus, FileText, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import LoginModal from '../auth/LoginModal';

const AI_PROVIDERS = [
  { id: 'chatgpt', name: 'ChatGPT (GPT-5.2)', color: 'bg-green-500' },
  { id: 'gemini', name: 'Gemini 2.5', color: 'bg-cyan-500' },
  { id: 'claude', name: 'Claude Sonnet 4.5', color: 'bg-purple-500' },
  { id: 'perplexity', name: 'Perplexity Sonar Pro', color: 'bg-teal-500' },
  { id: 'veo', name: 'Veo 3.1 (Video)', color: 'bg-blue-600' },
  { id: 'sora', name: 'Sora 2 (Video)', color: 'bg-pink-600' },
  { id: 'grok', name: 'Grok 4', color: 'bg-orange-500' },
  { id: 'flux', name: 'Flux 1.1 Pro Ultra', color: 'bg-violet-600' },
  { id: 'stable_diffusion', name: 'Stable Diffusion 3.5', color: 'bg-purple-600' },
  { id: 'midjourney', name: 'Midjourney', color: 'bg-fuchsia-500' },
  { id: 'ideogram', name: 'Ideogram v3', color: 'bg-pink-500' },
  { id: 'luma', name: 'Luma Ray2', color: 'bg-sky-600' },
  { id: 'deepseek', name: 'DeepSeek R1', color: 'bg-indigo-500' },
  { id: 'gamma', name: 'Gamma (Presentations)', color: 'bg-lime-500' },
  { id: 'kling', name: 'Kling v2.5 Turbo', color: 'bg-red-600' },
  { id: 'hailuo', name: 'Hailuo (Video)', color: 'bg-orange-600' },
  { id: 'runway', name: 'Runway Gen-4', color: 'bg-rose-500' },
  { id: 'heygen', name: 'HeyGen (Avatar)', color: 'bg-blue-500' },
  { id: 'elevenlabs', name: 'ElevenLabs (Voice)', color: 'bg-emerald-500' },
  { id: 'higgsfield', name: 'Higgsfield DOP', color: 'bg-yellow-600' },
  { id: 'nano_banana', name: 'Nano Banana Pro', color: 'bg-yellow-500' },
  { id: 'gpt_image', name: 'GPT Image 1.5', color: 'bg-green-600' },
  { id: 'pixverse', name: 'Pixverse (Video)', color: 'bg-teal-600' },
  { id: 'wan', name: 'Wan (Animation)', color: 'bg-cyan-600' },
  { id: 'pika', name: 'Pika v22', color: 'bg-red-500' },
  { id: 'vidu', name: 'Vidu (Video)', color: 'bg-purple-500' },
  { id: 'hedra', name: 'Hedra (Talking Photo)', color: 'bg-pink-400' },
  { id: 'veed', name: 'Veed (Talking Photo)', color: 'bg-blue-400' },
  { id: 'recraft', name: 'Recraft v3', color: 'bg-orange-400' },
  { id: 'hunyuan', name: 'Hunyuan v3', color: 'bg-red-400' },
  { id: 'bytedance', name: 'ByteDance Seedance', color: 'bg-slate-600' },
  { id: 'reve', name: 'Reve', color: 'bg-amber-600' },
  { id: 'meshy', name: 'Meshy AI (3D)', color: 'bg-lime-600' },
  { id: 'ltx', name: 'LTX v2 (Lightricks)', color: 'bg-indigo-600' },
  { id: 'topaz', name: 'Topaz (Upscaler)', color: 'bg-emerald-600' },
  { id: 'llama', name: 'Llama 3', color: 'bg-amber-500' },
  { id: 'mistral', name: 'Mistral AI', color: 'bg-slate-500' },
  { id: 'copyai', name: 'CopyAI', color: 'bg-sky-500' },
  { id: 'firefly', name: 'Adobe Firefly', color: 'bg-red-700' },
  { id: 'copilot', name: 'Microsoft Copilot', color: 'bg-blue-500' },
  { id: 'mm1', name: 'Apple MM1', color: 'bg-gray-500' },
  { id: 'huggingface', name: 'Hugging Face', color: 'bg-yellow-400' },
  { id: 'jasper', name: 'Jasper AI', color: 'bg-indigo-700' },
  { id: 'techpresso', name: 'Techpresso', color: 'bg-neutral-500' },
  { id: 'synthesia', name: 'Synthesia', color: 'bg-violet-500' }
];

export default function AIChat({ conversation, onUpdate }) {
  const [messages, setMessages] = useState(conversation?.messages || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(conversation?.current_provider || 'chatgpt');
  const [showProviderSwitch, setShowProviderSwitch] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    checkUser();
    loadUserContext();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const loadUserContext = async () => {
    setLoadingContext(true);
    try {
      const user = await base44.auth.me();
      const [progress, notes, studies, posts, savedContent] = await Promise.all([
        base44.entities.UserBibleProgress.filter({ created_by: user.email }),
        base44.entities.Note.filter({ created_by: user.email }, '-updated_date', 10),
        base44.entities.BibleStudy.filter({ created_by: user.email }, '-updated_date', 5),
        base44.entities.ForumPost.filter({ author_email: user.email }, '-updated_date', 5),
        base44.entities.SavedAIContent.filter({ created_by: user.email }, '-updated_date', 10)
      ]);
      
      setUserContext({
        progress: progress[0],
        recentNotes: notes,
        recentStudies: studies,
        recentPosts: posts,
        savedContent: savedContent,
        userEmail: user.email,
        userName: user.full_name,
        aiSettings: user.ai_assistant_settings || {}
      });
    } catch (error) {
      console.error('Error loading context:', error);
    }
    setLoadingContext(false);
  };

  const handleSend = async (retryCount = 0) => {
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

    const maxRetries = AI_PROVIDERS.length;
    
    try {
      // Build context from conversation
      const conversationContext = newMessages
        .slice(-10)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      // First, check if user wants to build an app/website
      const intentCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user message and determine the intent:

      User message: "${input}"

      Is the user asking to:
      1. Build/create an app, website, or web page?
      2. Generate HTML, CSS, or JavaScript code?
      3. Design a user interface or landing page?

      Also check for:
      4. Signs of depression, suicidal ideation, or self-harm
      5. Offensive, hateful, or inappropriate content`,
        response_json_schema: {
          type: "object",
          properties: {
            is_app_building_request: { type: "boolean" },
            app_type: { type: "string", enum: ["website", "landing_page", "web_app", "none"] },
            has_mental_health_concern: { type: "boolean" },
            has_offensive_content: { type: "boolean" },
            concern_level: { type: "string", enum: ["none", "mild", "moderate", "severe"] }
          }
        }
      });

      const safetyCheck = intentCheck;

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

        // Handle app/website building requests
        if (intentCheck.is_app_building_request) {
        const appBuildingPrompt = `You are an expert web developer. Create a complete, production-ready ${intentCheck.app_type || 'website'} based on this request:

        "${input}"

        IMPORTANT INSTRUCTIONS:
        - Generate COMPLETE, WORKING code (HTML, CSS, and JavaScript combined in a single HTML file)
        - Include modern, beautiful styling with CSS
        - Make it fully responsive (mobile, tablet, desktop)
        - Add smooth animations and transitions
        - Include all necessary functionality
        - Use modern best practices
        - Add comments explaining key sections
        - Make it visually stunning and professional

        Return ONLY the complete HTML code, starting with <!DOCTYPE html>.
        Do NOT include any explanations, markdown formatting, or code blocks - JUST the raw HTML code.`;

        const codeResponse = await base44.integrations.Core.InvokeLLM({
          prompt: appBuildingPrompt,
          add_context_from_internet: true
        });

        // Extract code if wrapped in markdown
        let generatedCode = codeResponse.response || codeResponse;
        if (generatedCode.includes('```')) {
          const codeMatch = generatedCode.match(/```(?:html)?\n([\s\S]*?)```/);
          if (codeMatch) {
            generatedCode = codeMatch[1].trim();
          }
        }

        const assistantMessage = {
          role: 'assistant',
          content: `# Your App is Ready! 🎉\n\nI've created your ${intentCheck.app_type || 'website'}. Here's what I built:\n\n## Preview\n\nClick the button below to preview your app in a new window:\n\n<div style="margin: 20px 0;">\n  <button onclick="(function() {\n    const win = window.open('', '_blank', 'width=1200,height=800');\n    win.document.write(${JSON.stringify(generatedCode)});\n    win.document.close();\n  })()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">🚀 Preview Your App</button>\n</div>\n\n## Download\n\n<button onclick="(function() {\n  const code = ${JSON.stringify(generatedCode)};\n  const blob = new Blob([code], { type: 'text/html' });\n  const url = URL.createObjectURL(blob);\n  const a = document.createElement('a');\n  a.href = url;\n  a.download = 'my-app.html';\n  a.click();\n  URL.revokeObjectURL(url);\n})()" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-left: 10px;">💾 Download HTML File</button>\n\n## Code\n\nHere's your complete code:\n\n\`\`\`html\n${generatedCode}\n\`\`\`\n\n---\n\nWant to make changes? Just tell me what to modify!`,
          provider: currentProvider,
          timestamp: new Date().toISOString(),
          generated_code: generatedCode
        };

        const updatedMessages = [...newMessages, assistantMessage];
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

        // Build user context for personalization
      let contextInfo = '';
      if (userContext) {
        const aiSettings = userContext.aiSettings || {};
        
        contextInfo = `\n\nUSER CONTEXT (use this to personalize your response):
      - Currently reading: ${userContext.progress?.current_book} ${userContext.progress?.current_chapter}:${userContext.progress?.current_verse}
      - Preferred translation: ${userContext.progress?.preferred_translation || 'KJV'}
      - Total verses read: ${userContext.progress?.verses_read || 0}`;

        if (userContext.recentNotes?.length > 0) {
          contextInfo += `\n- Recent study topics: ${userContext.recentNotes.map(n => n.title).slice(0, 3).join(', ')}`;
        }

        if (userContext.recentStudies?.length > 0) {
          contextInfo += `\n- Recent studies: ${userContext.recentStudies.map(s => s.title).slice(0, 2).join(', ')}`;
        }

        if (userContext.recentPosts?.length > 0) {
          contextInfo += `\n- Recent forum topics: ${userContext.recentPosts.map(p => p.title).slice(0, 2).join(', ')}`;
        }

        if (userContext.savedContent?.length > 0) {
          contextInfo += `\n- Saved AI content topics: ${userContext.savedContent.map(c => c.title).slice(0, 3).join(', ')}`;
        }

        // Add AI settings preferences
        if (aiSettings.response_length) {
          contextInfo += `\n\nUSER PREFERENCES:
      - Response length: ${aiSettings.response_length} (adjust your response length accordingly)`;
        }

        if (aiSettings.personality) {
          contextInfo += `\n- Preferred tone: ${aiSettings.personality}`;
        }

        if (aiSettings.use_scripture === false) {
          contextInfo += `\n- User prefers minimal scripture references`;
        }

        if (aiSettings.custom_instructions) {
          contextInfo += `\n- Custom instructions: ${aiSettings.custom_instructions}`;
        }
      }

      const prompt = `You are a Christ-like AI assistant for Alpha Omega Team, a Christian educational platform.

      IMPORTANT GUIDELINES:
      - When asked about CURRENT EVENTS (news, earthquakes, politics, weather, disasters, wars, deaths, etc.), provide FACTUAL, SPECIFIC information from your internet search context
      - Give actual numbers, names, dates, and details when requested
      - For general conversation or greetings, keep responses SHORT and Christ-like
      - Be gentle, encouraging, and factually accurate
      - Always speak with grace and wisdom
      - Use the user context to provide PERSONALIZED insights
      - If asked about building apps/websites, let them know you can create complete web applications for them
      ${contextInfo}

      Previous conversation context:
      ${conversationContext}

      Respond with both factual accuracy and Christ-like warmth.`;

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
      console.error(`Error with ${getCurrentProviderInfo().name}:`, error);
      
      // Try next provider if retries remain
      if (retryCount < maxRetries - 1) {
        setShowProviderSwitch(true);
        rotateProvider();
        
        // Show switching message briefly
        const switchingMessage = {
          role: 'assistant',
          content: `${getCurrentProviderInfo().name} is unavailable. Automatically switching to the next provider...`,
          provider: currentProvider,
          timestamp: new Date().toISOString()
        };
        setMessages([...newMessages, switchingMessage]);
        
        // Wait for state to update, then retry
        setTimeout(() => {
          setInput(userMessage.content);
          setMessages(messages); // Reset to before user message
          handleSend(retryCount + 1);
        }, 1500);
      } else {
        // All providers failed
        const errorMessage = {
          role: 'assistant',
          content: 'All AI providers are currently experiencing issues. Please try again in a moment.',
          provider: currentProvider,
          timestamp: new Date().toISOString()
        };
        setMessages([...newMessages, errorMessage]);
        setLoading(false);
      }
      return;
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

  const handleSaveContent = async (message) => {
    if (!user) {
      setLoginAction('save this content');
      setShowLoginModal(true);
      return;
    }
    try {
      const title = prompt('Enter a title for this saved content:');
      if (!title) return;

      await base44.entities.SavedAIContent.create({
        title: title,
        content: message.content,
        content_type: 'study',
        conversation_id: conversation?.id,
        tags: []
      });

      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    }
  };

  const handleSaveAsStudy = async (message) => {
    if (!user) {
      setLoginAction('save this as a Bible study');
      setShowLoginModal(true);
      return;
    }
    try {
      const title = prompt('Enter a title for this Bible study:');
      if (!title) return;

      await base44.entities.BibleStudy.create({
        title: title,
        content: message.content,
        description: 'Created from AI conversation',
        level: 'intermediate',
        category: 'exegesis',
        is_public: false
      });

      alert('Bible study created successfully!');
    } catch (error) {
      console.error('Error creating study:', error);
      alert('Failed to create study');
    }
  };

  const handleSaveEntireConversation = async () => {
    if (!user) {
      setLoginAction('save this conversation');
      setShowLoginModal(true);
      return;
    }
    try {
      const title = prompt('Enter a title for this saved conversation:');
      if (!title) return;

      const conversationText = messages
        .map(m => `**${m.role === 'user' ? 'User' : 'Assistant'}**: ${m.content}`)
        .join('\n\n');

      await base44.entities.SavedAIContent.create({
        title: title,
        content: conversationText,
        content_type: 'study',
        conversation_id: conversation?.id,
        tags: ['conversation']
      });

      alert('Entire conversation saved successfully!');
    } catch (error) {
      console.error('Error saving conversation:', error);
      alert('Failed to save conversation');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        action={loginAction}
      />
      
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">{conversation?.title || 'New Conversation'}</h1>
          <div className="flex items-center gap-2">
            <Select
              value={currentProvider}
              onValueChange={(value) => {
                setCurrentProvider(value);
                if (onUpdate) {
                  onUpdate({ current_provider: value });
                }
              }}
            >
              <SelectTrigger className="w-[180px] h-8 text-sm border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveEntireConversation}
              disabled={messages.length === 0}
              className="text-slate-600 hover:text-slate-900"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-medium text-slate-800 mb-2">How can I help you today?</h3>
                <p className="text-slate-600">Ask me about Bible study, theology, or get help with your projects</p>
              </div>
            )}

            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Bot className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 mb-2 text-sm">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-slate max-w-none text-slate-800 leading-relaxed">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-slate-800 leading-relaxed">{message.content}</p>
                    )}
                    
                    {message.role === 'assistant' && (
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveContent(message)}
                          className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <BookmarkPlus className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveAsStudy(message)}
                          className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Study
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-2 text-sm">Assistant</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Assistant..."
              className="min-h-[80px] pr-12 resize-none border-slate-300 focus:border-slate-400 focus:ring-slate-400 text-slate-800 bg-white"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="icon"
              className="absolute bottom-3 right-3 h-8 w-8 bg-slate-800 hover:bg-slate-900 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}