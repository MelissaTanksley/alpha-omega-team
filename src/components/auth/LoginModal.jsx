import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { BookOpen, Lock } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, action = "save this content" }) {
  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-amber-500/20 rounded-full">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Sign In Required</DialogTitle>
          <DialogDescription className="text-center text-base">
            You need to sign in to {action}. Create a free account to track your progress and save your content!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              With a free account you can:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
              <li>Track your Bible reading progress</li>
              <li>Save notes and study content</li>
              <li>Participate in community discussions</li>
              <li>Access AI-powered Bible study tools</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleLogin}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
            >
              Sign In / Create Account
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}