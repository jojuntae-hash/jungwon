"use client";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fontOptions } from '@/lib/fonts';
import styles from './page.module.css';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings state
  const [settings, setSettings] = useState({
    bannerText: '조정원의 정원',
    bannerPos: 'left',
    bannerFontSize: 48,
    bannerImage: '/images/hero_banner.png',
    albumFont: "'Noto Sans KR', sans-serif",
    albumFontSize: 20,
    albumAlign: 'left',
    showAlbumTitle: true,
    showBanner: true,
  });

  useEffect(() => {
    const fetchSettingsAndPosts = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Settings from Supabase
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'global')
          .single();

        let currentSettings = settings;
        let selectedIds: string[] = [];

        if (settingsData && !settingsError) {
          currentSettings = {
            bannerText: settingsData.banner_text ?? '조정원의 정원',
            bannerPos: settingsData.banner_pos || 'left',
            bannerFontSize: settingsData.banner_font_size || 48,
            bannerImage: settingsData.banner_image_url || '/images/hero_banner.png',
            albumFont: fontOptions.find(f => f.id === settingsData.home_album_font || f.family === settingsData.home_album_font)?.family || "'Noto Sans KR', sans-serif",
            albumFontSize: settingsData.home_album_font_size || 20,
            albumAlign: settingsData.home_album_align || 'left',
            showAlbumTitle: settingsData.home_show_album_title ?? true,
            showBanner: settingsData.show_banner ?? true,
          };
          setSettings(currentSettings);
          selectedIds = settingsData.selected_home_posts || [];
        }

        // 2. Fetch Posts based on selected IDs or default
        let query = supabase.from('posts').select('*');
        
        if (selectedIds.length > 0) {
          query = query.in('id', selectedIds);
        } else {
          query = query.order('created_at', { ascending: false }).limit(8);
        }

        const { data, error } = await query;

        if (!error && data) {
          if (selectedIds.length > 0) {
            const sortedData = [...data].sort((a, b) => 
              selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id)
            );
            setPosts(sortedData);
          } else {
            setPosts(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettingsAndPosts();
  }, []);

  // Ensure exactly 8 cards are shown for the 4x2 grid
  const displayCards = [...posts];
  while (displayCards.length < 8) {
    displayCards.push({ id: `empty-${displayCards.length}`, isEmpty: true });
  }

  // Helper to map alignment to flex properties
  const getAlignmentProps = (align: string) => {
    switch (align) {
      case 'center': return { justifyContent: 'center', textAlign: 'center' as const };
      case 'right': return { justifyContent: 'flex-end', textAlign: 'right' as const };
      default: return { justifyContent: 'flex-start', textAlign: 'left' as const };
    }
  };

  const albumAlignProps = getAlignmentProps(settings.albumAlign);
  const bannerAlignProps = getAlignmentProps(settings.bannerPos);

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#000', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        정원의 정원을 불러오는 중...
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        {settings.showBanner && (
          <section 
            className={styles.heroBanner} 
            style={{ 
              backgroundImage: `url(${settings.bannerImage})`,
            }}
          >
          </section>
        )}

        {/* Card List Section */}
        <section className={styles.cardListSection}>
          <div className={styles.grid}>
            {displayCards.map((card) => {
              if (card.isEmpty) {
                return <div key={card.id} className={styles.emptyCard} />;
              }

              return (
                <Link key={card.id} href={`/post/${card.id}`} style={{ textDecoration: 'none' }}>
                  <div className={styles.card}>
                    <div className={styles.imageContainer}>
                      {card.thumbnail_url ? (
                        <img src={card.thumbnail_url} alt={card.title} className={styles.cardImage} />
                      ) : (
                        <div className={`${styles.cardImage} ${styles.cardPlaceholder}`}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {settings.showAlbumTitle && (
                      <div 
                        className={styles.cardInfo}
                        style={{ 
                          '--album-font-size': `${settings.albumFontSize}px`,
                          '--album-align': settings.albumAlign,
                          justifyContent: albumAlignProps.justifyContent,
                          textAlign: albumAlignProps.textAlign
                        } as any}
                      >
                        <span className={styles.cardTitle}>
                          {card.title}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className={styles.viewMoreContainer}>
            <Link href="/album">
              <button className={styles.btnSecondary}>
                전체 앨범 더보기
              </button>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        © 2024 정원의 정원. All moments cherished.
      </footer>
    </>
  );
}
