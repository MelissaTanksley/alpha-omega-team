import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function SignIn() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      window.location.href = '/';
    }
  };

  const handleSignIn = () => {
    base44.auth.redirectToLogin(window.location.origin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="bg-white/95 backdrop-blur-sm border-amber-200 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69552d682a4e973d9943fc93/1bc2f2467_Designer2.png"
                alt="Alpha Omega"
                className="h-48 w-48 object-contain mx-auto"
              />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Welcome to Alpha Omega Team
            </CardTitle>
            <CardDescription className="text-lg">
              Christians working together to study God's Word
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
              <p className="text-slate-700 text-center">
                Join our community to access daily Bible verses, AI-powered study tools, 
                collaborative projects, and more.
              </p>
            </div>

            <Button
              onClick={handleSignIn}
              className="w-full h-12 text-lg bg-amber-600 hover:bg-amber-700"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In / Sign Up
            </Button>

            <div className="text-center text-sm text-slate-600">
              <p>By signing in, you agree to our terms of service</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-slate-300 text-sm italic">
            "For where two or three gather in my name, there am I with them."
            <br />
            <span className="text-amber-400">- Matthew 18:20</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}