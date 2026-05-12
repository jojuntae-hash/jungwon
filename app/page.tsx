export const runtime = 'edge';
export const revalidate = 3600; // 1시간 캐시로 DB 부하 최소화 및 성능 극대화

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
    // 1. Fetch Settings and Latest Posts in parallel for speed
    const [settingsRes, latestPostsRes] = await Promise.all([
      supabase
        .from('site_settings')
        .select('banner_text, banner_pos, banner_font_size, banner_image_url, font_family, album_font_size, album_align, show_album_title, show_banner, selected_home_posts')
        .eq('id', 'global')
        .single(),
      supabase
        .from('posts')
        .select('id, title, thumbnail_url, google_photos_link, created_at')
        .order('created_at', { ascending: false })
        .limit(8)
    ]);

    const settingsData = settingsRes.data;
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

    // 2. Determine posts to display
    if (selectedIds.length > 0) {
      // If specific posts are selected, fetch them
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, title, thumbnail_url, google_photos_link, created_at')
        .in('id', selectedIds);
      
      if (postsData && !postsError) {
        posts = [...postsData].sort((a, b) => 
          selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id)
        );
      } else {
        // Fallback to latest posts if fetch fails
        posts = latestPostsRes.data || [];
      }
    } else {
      // Use the pre-fetched latest posts
      posts = latestPostsRes.data || [];
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
            {settings.bannerText && (
              <div 
                className={styles.bannerOverlay}
                style={{ 
                  justifyContent: settings.bannerPos === 'center' ? 'center' : settings.bannerPos === 'right' ? 'flex-end' : 'flex-start',
                  textAlign: settings.bannerPos as any
                }}
              >
                <h1 
                  className={styles.bannerTitle}
                  style={{ 
                    fontSize: `${settings.bannerFontSize}px`,
                    fontFamily: settings.albumFont
                  }}
                >
                  {settings.bannerText}
                </h1>
              </div>
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

              const cardUrl = card.google_photos_link || `/post/${card.id}`;
              const isExternal = !!card.google_photos_link;

              return (
                <Link 
                  key={card.id} 
                  href={cardUrl} 
                  target={isExternal ? "_blank" : "_self"}
                  style={{ textDecoration: 'none' }}
                >
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
