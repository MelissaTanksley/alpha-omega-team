import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Save, AlertCircle, CheckCircle2, Eye, EyeOff, Upload, User as UserIcon, UserCheck, UserX } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { motion } from 'framer-motion';

export default function AISettings() {
  const [user, setUser] = useState(null);
  const [apiKeys, setApiKeys] = useState({
    openai_key: '',
    anthropic_key: '',
    grok_key: '',
    gemini_key: '',
    perplexity_key: '',
    deepseek_key: ''
  });
  const [preferredProvider, setPreferredProvider] = useState('default');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState({});
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.api_keys) {
        setApiKeys({ ...apiKeys, ...userData.api_keys });
      }
      if (userData.preferred_ai_provider) {
        setPreferredProvider(userData.preferred_ai_provider);
      }
      if (userData.profile_picture_url) {
        setProfilePicture(userData.profile_picture_url);
      }
      if (userData.is_visible !== undefined) {
        setIsVisible(userData.is_visible);
      }
      } catch (error) {
      console.error('Error loading user:', error);
      }
      };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        api_keys: apiKeys,
        preferred_ai_provider: preferredProvider,
        is_visible: isVisible
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  const providers = [
    { id: 'default', name: 'Default (Free)', icon: '🆓' },
    { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', keyField: 'openai_key' },
    { id: 'claude', name: 'Claude', icon: '🧠', keyField: 'anthropic_key' },
    { id: 'grok', name: 'Grok', icon: '⚡', keyField: 'grok_key' },
    { id: 'gemini', name: 'Gemini', icon: '💎', keyField: 'gemini_key' },
    { id: 'perplexity', name: 'Perplexity', icon: '🔍', keyField: 'perplexity_key' },
    { id: 'deepseek', name: 'DeepSeek', icon: '🌊', keyField: 'deepseek_key' }
  ];

  const toggleShowKey = (field) => {
    setShowKeys({ ...showKeys, [field]: !showKeys[field] });
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPicture(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const pictureUrl = result.file_url;
      
      await base44.auth.updateMe({
        profile_picture_url: pictureUrl
      });
      
      setProfilePicture(pictureUrl);
      setUser({ ...user, profile_picture_url: pictureUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    }
    setUploadingPicture(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Key className="h-10 w-10 text-amber-400" />
          AI Service Settings
        </h1>
        <p className="text-slate-300 text-lg">Connect your paid AI services for enhanced features</p>
      </motion.div>

      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Profile Picture</CardTitle>
          <CardDescription>Upload a profile picture for forum posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-amber-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                <UserIcon className="w-12 h-12 text-slate-500" />
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="profile-picture" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
                  <Upload className="h-4 w-4" />
                  {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
                </div>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                  disabled={uploadingPicture}
                />
              </Label>
              <p className="text-sm text-slate-400 mt-2">Recommended: Square image, at least 200x200px</p>
            </div>
          </div>
        </CardContent>
        </Card>

        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Privacy Settings</CardTitle>
          <CardDescription>Control your visibility in the community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isVisible ? (
                <UserCheck className="h-5 w-5 text-green-400" />
              ) : (
                <UserX className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <Label className="text-slate-300">Show me in Active Members</Label>
                <p className="text-sm text-slate-400">
                  {isVisible 
                    ? "You're visible in the Community dropdown" 
                    : "You're hidden from the Active Members list"}
                </p>
              </div>
            </div>
            <Switch
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
          </div>
        </CardContent>
        </Card>

        <Alert className="bg-blue-500/20 border-blue-500/50">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>Note:</strong> Using your own API keys requires backend functions to be enabled. 
          Contact support if you need this feature activated.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Preferred AI Provider</CardTitle>
          <CardDescription>Choose which AI service to use by default</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={preferredProvider} onValueChange={setPreferredProvider}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.icon} {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">API Keys</CardTitle>
          <CardDescription>
            Enter your personal API keys to use your paid subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.filter(p => p.keyField).map(provider => (
            <div key={provider.keyField} className="space-y-2">
              <Label className="text-slate-300">
                {provider.icon} {provider.name} API Key
              </Label>
              <div className="relative">
                <Input
                  type={showKeys[provider.keyField] ? "text" : "password"}
                  value={apiKeys[provider.keyField] || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, [provider.keyField]: e.target.value })}
                  placeholder={`sk-...`}
                  className="bg-slate-800 border-slate-700 text-slate-200 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full text-slate-400 hover:text-slate-200"
                  onClick={() => toggleShowKey(provider.keyField)}
                >
                  {showKeys[provider.keyField] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}

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
          <h3 className="font-semibold text-lg text-blue-300">
            How to Get API Keys
          </h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>• <strong>ChatGPT:</strong> Get your API key from platform.openai.com</li>
            <li>• <strong>Claude:</strong> Sign up at console.anthropic.com</li>
            <li>• <strong>Grok:</strong> Available through x.ai developer portal</li>
            <li>• <strong>Gemini:</strong> Get your key from ai.google.dev</li>
            <li>• <strong>Perplexity:</strong> Access via perplexity.ai API</li>
            <li>• <strong>DeepSeek:</strong> Register at platform.deepseek.com</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}