export const runtime = 'edge';
export const revalidate = 0;

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/Header';
import { createClient } from '@/lib/supabase_new/server';
import { fontOptions } from '@/lib/fonts';
import styles from './page.module.css';
import TimelineList from './TimelineList';

export default async function TimelinePage() {
  const supabase = await createClient();
  
  // 1. Fetch Settings & First 10 Posts in parallel
  const [settingsRes, postsRes] = await Promise.all([
    supabase.from('site_settings').select('font_family').eq('id', 'global').single(),
    supabase.from('posts')
      .select('*')
      .order('title', { ascending: false })
      .range(0, 9) // Initial load: first 10 posts
  ]);

  const settingsData = settingsRes.data;
  const initialPosts = postsRes.data || [];

  const foundFont = settingsData 
    ? fontOptions.find(f => f.id === settingsData.font_family || f.family === settingsData.font_family)
    : null;
  const fontFamily = foundFont ? foundFont.family : "'Noto Sans KR', sans-serif";

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title} style={{ fontFamily }}>추억의 정원 산책길 🌿</h1>
          <p className={styles.subtitle}>시간의 흐름을 따라 소중한 순간들을 되짚어보세요.</p>
        </div>

        <TimelineList initialPosts={initialPosts} fontFamily={fontFamily} />
      </main>
    </>
  );
}
