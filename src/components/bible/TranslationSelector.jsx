import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BookOpen } from 'lucide-react';

const TRANSLATIONS = [
  { value: 'KJV', label: 'King James Version', year: '1611' },
  { value: 'NIV', label: 'New International Version', year: '1978' },
  { value: 'ESV', label: 'English Standard Version', year: '2001' },
  { value: 'NASB', label: 'New American Standard Bible', year: '1971' },
  { value: 'NLT', label: 'New Living Translation', year: '1996' },
  { value: 'NKJV', label: 'New King James Version', year: '1982' },
  { value: 'AMP', label: 'Amplified Bible', year: '1965' },
  { value: 'MSG', label: 'The Message', year: '2002' }
];

export default function TranslationSelector({ value, onChange, showLabel = true }) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <Label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <BookOpen className="h-4 w-4 text-slate-200" />
          Preferred Translation
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full md:w-64 text-white [&>span]:text-white">
          <SelectValue placeholder="Select translation" />
        </SelectTrigger>
        <SelectContent>
          {TRANSLATIONS.map(t => (
            <SelectItem key={t.value} value={t.value}>
              <div className="flex justify-between items-center w-full">
                <span className="text-slate-800">{t.value}</span>
                <span className="text-xs text-slate-700 ml-2">{t.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}