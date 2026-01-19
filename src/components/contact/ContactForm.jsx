import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function ContactForm({ language = 'en' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    
    const checkTheme = setInterval(() => {
      const theme = localStorage.getItem('theme');
      setIsDarkMode(theme === 'dark');
    }, 100);
    
    return () => clearInterval(checkTheme);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'Alpha Omega Contact Form',
        to: 'alphaomegateam.llc@gmail.com',
        subject: language === 'es' 
          ? `Nuevo mensaje de contacto de ${formData.name}`
          : `New Contact Form Message from ${formData.name}`,
        body: `
Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}

---
Reply to: ${formData.email}
        `
      });

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error?.message || error?.toString() || 'Unknown error';
      alert(language === 'es' 
        ? `Error al enviar el mensaje. Por favor intenta de nuevo. Detalle: ${errorMsg}`
        : `Error sending message. Please try again. Details: ${errorMsg}`);
    }

    setLoading(false);
  };

  const texts = {
    en: {
      title: 'Contact Us',
      subtitle: 'Have questions? We\'d love to hear from you.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully! We\'ll get back to you soon.',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'your@email.com',
      messagePlaceholder: 'Your message...'
    },
    es: {
      title: 'Contáctanos',
      subtitle: '¿Tienes preguntas? Nos encantaría saber de ti.',
      name: 'Nombre',
      email: 'Correo Electrónico',
      message: 'Mensaje',
      send: 'Enviar Mensaje',
      sending: 'Enviando...',
      success: '¡Mensaje enviado con éxito! Te responderemos pronto.',
      namePlaceholder: 'Tu nombre',
      emailPlaceholder: 'tu@correo.com',
      messagePlaceholder: 'Tu mensaje...'
    }
  };

  const t = texts[language];

  return (
    <Card className={isDarkMode 
      ? "bg-slate-900/70 backdrop-blur-sm border-slate-700 shadow-xl"
      : "bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl"
    }>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={isDarkMode 
            ? "p-2 bg-amber-500/20 rounded-xl"
            : "p-2 bg-amber-100 rounded-xl"
          }>
            <Mail className={isDarkMode 
              ? "h-5 w-5 text-amber-400"
              : "h-5 w-5 text-amber-600"
            } />
          </div>
          <div>
            <CardTitle className={isDarkMode 
              ? "text-slate-200"
              : "text-slate-800"
            }>{t.title}</CardTitle>
            <p className={isDarkMode 
              ? "text-sm text-slate-400 mt-1"
              : "text-sm text-slate-600 mt-1"
            }>{t.subtitle}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
          >
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{t.success}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                {t.name}
              </Label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.namePlaceholder}
                className={isDarkMode 
                  ? "bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  : "bg-white border-slate-300 text-slate-800"
                }
              />
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                {t.email}
              </Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t.emailPlaceholder}
                className={isDarkMode 
                  ? "bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  : "bg-white border-slate-300 text-slate-800"
                }
              />
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                {t.message}
              </Label>
              <Textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t.messagePlaceholder}
                rows={5}
                className={isDarkMode 
                  ? "bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  : "bg-white border-slate-300 text-slate-800"
                }
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t.sending}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {t.send}
                </span>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}