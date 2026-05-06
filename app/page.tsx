"use client";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
    albumFont: 'Inter',
    albumFontSize: 20,
    albumAlign: 'left',
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
            albumFont: settingsData.album_font || 'Inter',
            albumFontSize: settingsData.album_font_size || 20,
            albumAlign: settingsData.album_align || 'left',
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

  return (
    <>
      <div className={styles.container}>
        {settings.showBanner && (
          <section 
            className={styles.heroBanner} 
            style={{ 
              backgroundImage: `url(${settings.bannerImage})`,
              justifyContent: bannerAlignProps.justifyContent 
            }}
          >
            {settings.bannerText && settings.bannerText.trim() !== '' && (
              <>
                <div className={styles.heroOverlay} />
                <div 
                  className={styles.heroContent}
                  style={{ 
                    left: settings.bannerPos === 'left' ? '0' : 'auto',
                    right: settings.bannerPos === 'right' ? '0' : 'auto',
                    width: settings.bannerPos === 'center' ? '100%' : 'auto',
                    textAlign: bannerAlignProps.textAlign
                  }}
                >
                  <h1 
                    className={styles.heroTitle}
                    style={{ fontSize: `${settings.bannerFontSize}px` }}
                  >
                    {settings.bannerText}
                  </h1>
                </div>
              </>
            )}
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
                    {card.thumbnail_url ? (
                      <img src={card.thumbnail_url} alt={card.title} className={styles.cardImage} />
                    ) : (
                      <div className={`${styles.cardImage} ${styles.cardPlaceholder}`}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                        </svg>
                      </div>
                    )}

                    <div 
                      className={styles.cardOverlay}
                      style={{ justifyContent: albumAlignProps.justifyContent }}
                    >
                      <span 
                        className={styles.cardTitle}
                        style={{ 
                          fontFamily: settings.albumFont,
                          fontSize: `${settings.albumFontSize}px`,
                          textAlign: albumAlignProps.textAlign
                        }}
                      >
                        {card.title}
                      </span>
                    </div>
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
