export const runtime = 'edge';
export const revalidate = 60;

import { createClient } from '@/lib/supabase_new/server';
import { fontOptions } from '@/lib/fonts';
import AlbumClient from './AlbumClient';

export default async function AlbumPage() {
  const supabase = await createClient();

  // 1. Fetch Settings & Posts in parallel for maximum speed
  const [settingsRes, postsRes] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 'global').single(),
    supabase.from('posts').select('id, title, created_at, thumbnail_url, google_photos_link, tags').order('created_at', { ascending: false })
  ]);

  // 2. Prepare Settings with defaults
  const settingsData = settingsRes.data;
  const settings = {
    albumFont: settingsData ? (fontOptions.find(f => f.id === settingsData.font_family || f.family === settingsData.font_family)?.family || "'Noto Sans KR', sans-serif") : "'Noto Sans KR', sans-serif",
    albumFontSize: settingsData?.album_font_size || 18,
    albumAlign: settingsData?.album_align || 'center',
    showAlbumTitle: settingsData?.show_album_title ?? true,
  };

  const posts = postsRes.data || [];

  return (
    <AlbumClient 
      initialPosts={posts} 
      settings={settings}
    />
  );
}
