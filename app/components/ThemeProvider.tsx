"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { themes } from '@/lib/themes';
import { fontOptions } from '@/lib/fonts';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState('classic-garden');
  const [currentFontId, setCurrentFontId] = useState('noto-sans');

  useEffect(() => {
    const fetchTheme = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('theme, font_family')
        .eq('id', 'global')
        .single();

      if (data && !error) {
        setCurrentThemeId(data.theme || 'classic-garden');
        setCurrentFontId((data as any).font_family || 'noto-sans');
      }
    };

    fetchTheme();
    
    // Optional: Real-time update if someone else changes it
    const channel = supabase
      .channel('theme-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'site_settings',
        filter: 'id=eq.global'
      }, (payload) => {
        if (payload.new.theme) {
          setCurrentThemeId(payload.new.theme);
        }
        if (payload.new.font_family) {
          setCurrentFontId(payload.new.font_family);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const theme = themes.find(t => t.id === currentThemeId) || themes[0];
    const font = fontOptions.find(f => f.id === currentFontId) || fontOptions[0];
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--bg-color', theme.background);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--main-font', font.family);
    
    // Also update body background and font
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
    document.body.style.fontFamily = font.family;
  }, [currentThemeId, currentFontId]);

  return <>{children}</>;
}
