export const runtime = 'edge';
export const revalidate = 0; // 최신 데이터를 보장하면서 서버에서 렌더링

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase_new/server';
import { fontOptions } from '@/lib/fonts';
import styles from './page.module.css';

export default async function Home() {
  const supabase = await createClient();
  // 1. Fetch Data on the Server
  let settings = {
    bannerText: '조정원의 정원',
    bannerPos: 'left',
    bannerFontSize: 48,
    bannerImage: '/images/hero_banner.png',
    albumFont: "'Noto Sans KR', sans-serif",
    albumFontSize: 20,
    albumAlign: 'left',
    showAlbumTitle: true,
    showBanner: true,
  };

  let posts: any[] = [];
  let selectedIds: string[] = [];

  try {
    // Fetch Settings
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (settingsData) {
      settings = {
        bannerText: settingsData.banner_text ?? '조정원의 정원',
        bannerPos: settingsData.banner_pos || 'left',
        bannerFontSize: settingsData.banner_font_size || 48,
        bannerImage: settingsData.banner_image_url || '/images/hero_banner.png',
        albumFont: fontOptions.find(f => f.id === settingsData.font_family || f.family === settingsData.font_family)?.family || "'Noto Sans KR', sans-serif",
        albumFontSize: settingsData.album_font_size || 20,
        albumAlign: settingsData.album_align || 'left',
        showAlbumTitle: settingsData.show_album_title ?? true,
        showBanner: settingsData.show_banner ?? true,
      };
      selectedIds = settingsData.selected_home_posts || [];
    }

    // Fetch Posts
    let query = supabase.from('posts').select('*');
    if (selectedIds.length > 0) {
      query = query.in('id', selectedIds);
    } else {
      query = query.order('created_at', { ascending: false }).limit(8);
    }

    const { data } = await query;
    if (data) {
      if (selectedIds.length > 0) {
        posts = [...data].sort((a, b) => 
          selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id)
        );
      } else {
        posts = data;
      }
    }
  } catch (err) {
    console.error('Error fetching data on server:', err);
  }

  // Ensure exactly 8 cards are shown
  const displayCards = [...posts];
  while (displayCards.length < 8) {
    displayCards.push({ id: `empty-${displayCards.length}`, isEmpty: true });
  }

  const getAlignmentProps = (align: string) => {
    switch (align) {
      case 'center': return { justifyContent: 'center', textAlign: 'center' as const };
      case 'right': return { justifyContent: 'flex-end', textAlign: 'right' as const };
      default: return { justifyContent: 'flex-start', textAlign: 'left' as const };
    }
  };

  const albumAlignProps = getAlignmentProps(settings.albumAlign);

  return (
    <>
      <div className={styles.container}>
        {settings.showBanner && (
          <section className={styles.heroBanner}>
            <Image 
              src={settings.bannerImage}
              alt="Hero Banner"
              fill
              priority
              className={styles.heroImage}
              style={{ objectFit: 'cover' }}
            />
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
                        <Image 
                          src={card.thumbnail_url} 
                          alt={card.title} 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className={styles.cardImage}
                          style={{ objectFit: 'cover' }}
                        />
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
                          '--album-font': settings.albumFont,
                          '--album-align': settings.albumAlign,
                          justifyContent: albumAlignProps.justifyContent,
                          textAlign: albumAlignProps.textAlign
                        } as any}
                      >
                        <span 
                          className={styles.cardTitle}
                          style={{ 
                            fontFamily: settings.albumFont,
                            fontSize: `${settings.albumFontSize}px`,
                            textAlign: settings.albumAlign as any
                          }}
                        >
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

      <footer className={styles.footer}>
        © 2024 정원의 정원. All moments cherished.
      </footer>
    </>
  );
}

