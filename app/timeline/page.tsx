export const runtime = 'edge';
export const revalidate = 0;

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/Header';
import { createClient } from '@/lib/supabase_new/server';
import { fontOptions } from '@/lib/fonts';
import styles from './page.module.css';

export default async function TimelinePage() {
  const supabase = await createClient();
  
  // 1. Fetch Settings & Posts in parallel for speed
  const [settingsRes, postsRes] = await Promise.all([
    supabase.from('site_settings').select('font_family').eq('id', 'global').single(),
    supabase.from('posts').select('*').order('title', { ascending: false })
  ]);

  const settingsData = settingsRes.data;
  const posts = postsRes.data || [];

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

        <div className={styles.timeline}>
          <div className={styles.stem} />
          
          {posts.map((post, index) => {
            const externalLink = post.google_photos_link;
            const isExternal = !!externalLink;
            const cardUrl = externalLink || `/post/${post.id}`;
            
            const cardInner = (
              <div className={styles.contentCard}>
                <div className={styles.cardBody}>
                  {post.thumbnail_url && (
                    <div className={styles.imageWrapper}>
                      <Image 
                        src={post.thumbnail_url} 
                        alt={post.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority={index < 4} // Load first few images immediately
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className={styles.textContent}>
                    <h3 className={styles.cardTitle} style={{ fontFamily }}>{post.title}</h3>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={post.id} className={`${styles.item} ${index % 2 === 0 ? styles.left : styles.right}`}>
                <div className={styles.dot}>
                  <div className={styles.flower} />
                </div>
                <Link 
                  href={cardUrl} 
                  target={isExternal ? "_blank" : "_self"}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  {cardInner}
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
