import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Payments() {
  const [amount, setAmount] = useState('');

  const handlePayPalDonation = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }
    // Redirect to PayPal or open PayPal payment
    alert(`Redirecting to PayPal for donation of $${amount}`);
    // In production: window.location.href = `https://www.paypal.com/paypalme/yourusername/${amount}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Heart className="h-10 w-10 text-red-400" />
          Support Our Ministry
        </h1>
        <p className="text-slate-300 text-lg">Your donations help us continue sharing God's Word</p>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Make a Donation via PayPal</CardTitle>
          <CardDescription className="text-base">
            Send your donation securely through PayPal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">Donation Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-xl h-14"
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                onClick={() => setAmount(preset.toString())}
                className="h-12 text-base font-semibold hover:bg-amber-50"
              >
                ${preset}
              </Button>
            ))}
          </div>

          <Button
            onClick={handlePayPalDonation}
            className="w-full h-14 text-xl bg-blue-600 hover:bg-blue-700"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Heart className="h-5 w-5 mr-2" />
            Donate with PayPal
          </Button>

          <div className="text-center text-sm text-slate-600">
            <p>You'll be redirected to PayPal to complete your donation</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3 text-amber-900">
            Thank You for Your Generosity
          </h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            Your donations help us provide free Bible study resources, maintain our platform, 
            and spread the Gospel. Every contribution, no matter the size, makes a difference 
            in someone's spiritual journey.
          </p>
          <p className="text-slate-600 text-sm italic">
            "Each of you should give what you have decided in your heart to give, 
            not reluctantly or under compulsion, for God loves a cheerful giver." 
            - 2 Corinthians 9:7
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}