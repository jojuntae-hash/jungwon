export const runtime = 'edge';
export const revalidate = 0;

import { supabase } from '@/lib/supabase';
import { fontOptions } from '@/lib/fonts';
import AlbumClient from './AlbumClient';

export default async function AlbumPage() {
  // 1. Fetch Settings on the Server
  let settings = {
    albumFont: "'Noto Sans KR', sans-serif",
    albumFontSize: 18,
    albumAlign: 'center',
    showAlbumTitle: true,
  };

  try {
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (settingsData) {
      settings = {
        albumFont: fontOptions.find(f => f.id === settingsData.album_font || f.family === settingsData.album_font)?.family || "'Noto Sans KR', sans-serif",
        albumFontSize: settingsData.album_font_size || 18,
        albumAlign: settingsData.album_align || 'center',
        showAlbumTitle: settingsData.show_album_title ?? true,
      };
    }
  } catch (err) {
    console.error('Error fetching settings on server:', err);
  }

  // 2. Fetch Posts on the Server
  let posts: any[] = [];
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      posts = data;
    }
  } catch (err) {
    console.error('Error fetching posts on server:', err);
  }

  return <AlbumClient initialPosts={posts} settings={settings} />;
}

