import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Payments() {
  const [amount, setAmount] = useState('');

  const handlePayPalPayment = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    // Redirect to PayPal or open PayPal payment
    alert(`Redirecting to PayPal for payment of $${amount}`);
    // In production: window.location.href = `https://www.paypal.com/paypalme/yourusername/${amount}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Support Our Ministry</h1>
        <p className="text-slate-300">Your donations help us continue sharing God's Word</p>
      </div>

      <Tabs defaultValue="paypal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="zelle">Zelle</TabsTrigger>
        </TabsList>

        <TabsContent value="paypal" className="mt-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CreditCard className="h-6 w-6 text-blue-600" />
                PayPal Payment
              </CardTitle>
              <CardDescription>
                Send your donation securely through PayPal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Donation Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 text-lg h-12"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[10, 25, 50, 100].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1 min-w-[80px]"
                  >
                    ${preset}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handlePayPalPayment}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Continue with PayPal
              </Button>

              <div className="text-center text-sm text-slate-600">
                <p>You'll be redirected to PayPal to complete your donation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zelle" className="mt-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Smartphone className="h-6 w-6 text-purple-600" />
                Zelle Payment
              </CardTitle>
              <CardDescription>
                Send your donation directly through Zelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold text-lg mb-4 text-slate-800">
                  How to Send via Zelle:
                </h3>
                <ol className="space-y-3 text-slate-700">
                  <li className="flex gap-2">
                    <span className="font-semibold min-w-[24px]">1.</span>
                    <span>Open your banking app and select Zelle</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold min-w-[24px]">2.</span>
                    <span>Enter our Zelle email or phone:</span>
                  </li>
                  <li className="ml-8 bg-white px-4 py-3 rounded-lg border border-purple-300">
                    <p className="font-mono text-lg text-purple-900">donations@alphaomegateam.org</p>
                    <p className="text-sm text-slate-600 mt-1">or use phone: (555) 123-4567</p>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold min-w-[24px]">3.</span>
                    <span>Enter your donation amount</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold min-w-[24px]">4.</span>
                    <span>Add a note (optional) and send</span>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <strong>Note:</strong> Zelle transfers are instant and free. Please include your name 
                  in the note if you'd like a receipt for tax purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3 text-amber-900">
            Thank You for Your Generosity
          </h3>
          <p className="text-slate-700 leading-relaxed">
            Your donations help us provide free Bible study resources, maintain our platform, 
            and spread the Gospel. Every contribution, no matter the size, makes a difference 
            in someone's spiritual journey.
          </p>
          <p className="text-slate-600 text-sm mt-3 italic">
            "Each of you should give what you have decided in your heart to give, 
            not reluctantly or under compulsion, for God loves a cheerful giver." 
            - 2 Corinthians 9:7
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}