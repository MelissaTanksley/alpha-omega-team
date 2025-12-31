import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Save, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAssistantSettings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    response_length: 'balanced',
    personality: 'helpful',
    use_scripture: true,
    auto_save: false,
    context_depth: 10,
    custom_instructions: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.ai_assistant_settings) {
        setSettings({ ...settings, ...userData.ai_assistant_settings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        ai_assistant_settings: settings
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            AI Assistant Behavior
          </CardTitle>
          <CardDescription>Customize how the AI assistant responds to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-300">Response Length</Label>
            <Select value={settings.response_length} onValueChange={(value) => setSettings({ ...settings, response_length: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise - Short and to the point</SelectItem>
                <SelectItem value="balanced">Balanced - Standard responses</SelectItem>
                <SelectItem value="detailed">Detailed - Comprehensive explanations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">AI Personality</Label>
            <Select value={settings.personality} onValueChange={(value) => setSettings({ ...settings, personality: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="helpful">Helpful - Friendly and encouraging</SelectItem>
                <SelectItem value="scholarly">Scholarly - Academic and detailed</SelectItem>
                <SelectItem value="pastoral">Pastoral - Caring and supportive</SelectItem>
                <SelectItem value="teacher">Teacher - Educational and instructive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Conversation Context Depth (messages)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.context_depth]}
                onValueChange={(value) => setSettings({ ...settings, context_depth: value[0] })}
                min={5}
                max={50}
                step={5}
                className="flex-1"
              />
              <span className="text-slate-400 w-12 text-center">{settings.context_depth}</span>
            </div>
            <p className="text-xs text-slate-500">How many previous messages the AI remembers in each conversation</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">Include Scripture References</Label>
              <p className="text-sm text-slate-400">AI will reference Bible verses when appropriate</p>
            </div>
            <Switch
              checked={settings.use_scripture}
              onCheckedChange={(checked) => setSettings({ ...settings, use_scripture: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">Auto-Save Important Responses</Label>
              <p className="text-sm text-slate-400">Automatically save valuable AI responses</p>
            </div>
            <Switch
              checked={settings.auto_save}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_save: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Custom Instructions</Label>
            <Textarea
              value={settings.custom_instructions}
              onChange={(e) => setSettings({ ...settings, custom_instructions: e.target.value })}
              placeholder="Add any custom instructions for how the AI should respond to you..."
              className="min-h-[100px] bg-slate-800 border-slate-700 text-slate-200"
            />
            <p className="text-xs text-slate-500">These instructions will be included in every conversation</p>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-400"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Saved successfully!</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-lg text-blue-300 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Tips for Better Conversations
          </h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>• Be specific about what you need - the AI works best with clear questions</li>
            <li>• Provide context about your study or project for personalized responses</li>
            <li>• Use custom instructions to tell the AI your learning style or preferences</li>
            <li>• Higher context depth helps with complex, multi-part conversations</li>
            <li>• Auto-save captures valuable insights automatically to your library</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}