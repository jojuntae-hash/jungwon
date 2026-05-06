"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function AlbumPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    albumFont: 'Inter',
    albumFontSize: 18,
    albumAlign: 'center',
  });
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    // Load settings from Supabase
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'global')
          .single();

        if (data && !error) {
          setSettings({
            albumFont: data.album_font || 'Inter',
            albumFontSize: data.album_font_size || 18,
            albumAlign: data.album_align || 'center',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Fetch real posts from Supabase
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPosts(data);
        } else {
          console.error("Error fetching posts:", error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
    fetchPosts();
  }, []);

  const getAlignmentProps = (align: string) => {
    switch (align) {
      case 'center': return { justifyContent: 'center', textAlign: 'center' as const };
      case 'right': return { justifyContent: 'flex-end', textAlign: 'right' as const };
      default: return { justifyContent: 'flex-start', textAlign: 'left' as const };
    }
  };

  const albumAlignProps = getAlignmentProps(settings.albumAlign);

  const getSortedPosts = () => {
    const sorted = [...posts];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'random':
        return sorted.sort(() => Math.random() - 0.5);
      default: // latest
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  const sortedPosts = getSortedPosts();

  // 1. Filter posts by search query and favorites
  const filteredPosts = sortedPosts.filter(post => {
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = post.title.toLowerCase().includes(query);
    const tagsMatch = post.tags && Array.isArray(post.tags) 
      ? post.tags.some((tag: string) => tag.toLowerCase().includes(query))
      : false;
    
    const favoriteMatch = !onlyFavorites || post.is_favorite === true;
    
    return (titleMatch || tagsMatch) && favoriteMatch;
  });

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                className={styles.searchInput}
                placeholder="제목 또는 태그 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              className={`${styles.filterBtn} ${onlyFavorites ? styles.filterBtnActive : ''}`}
              onClick={() => setOnlyFavorites(!onlyFavorites)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={onlyFavorites ? "white" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              관심글만
            </button>
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.gridControls}>
              {[2, 3, 4].map(num => (
                <button 
                  key={num}
                  className={`${styles.gridBtn} ${gridCols === num ? styles.gridBtnActive : ''}`}
                  onClick={() => setGridCols(num)}
                  title={`${num}열로 보기`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <div className={styles.selectWrapper}>
              <select 
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name-asc">이름순 (ㄱ-ㅎ)</option>
                <option value="name-desc">이름순 (ㅎ-ㄱ)</option>
                <option value="random">랜덤 정렬</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.countBar}>
          총 <strong>{filteredPosts.length}</strong>개의 조각
        </div>

        <section className={styles.cardSection}>
          <div className={styles.grid} style={{ '--grid-cols': gridCols } as React.CSSProperties}>
            {/* 1. Post Cards */}
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className={styles.card}>
                <div className={styles.dateLabel}>
                  {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}
                </div>
                
                <div className={styles.cardImageWrapper}>
                  {post.thumbnail_url ? (
                    <img src={post.thumbnail_url} alt={post.title} className={styles.cardImage} />
                  ) : (
                    <div className={styles.cardPlaceholder}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D0C6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className={styles.cardContent}>
                  <div className={styles.titleRow}>
                    <h3 
                      className={styles.cardTitle}
                      style={{ 
                        fontFamily: settings.albumFont,
                        fontSize: `${settings.albumFontSize}px`,
                      }}
                    >
                      {post.title}
                    </h3>
                    <div className={styles.heartBtn}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={post.is_favorite ? "#E6A8A8" : "none"} stroke={post.is_favorite ? "#E6A8A8" : "#D0CCD3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                  </div>

                  <div className={styles.tagList}>
                    {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string, i: number) => (
                      <span key={i} className={styles.tagItem}>#{tag}</span>
                    ))}
                  </div>

                  <p className={styles.cardSnippet}>
                    {post.content ? (post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content) : '기록된 내용이 없습니다.'}
                  </p>
                </div>
              </Link>
            ))}

            {/* 2. Create New Card (Moved to end) */}
            <Link href="/record" className={styles.addCard}>
              <div className={styles.addIconWrapper}>
                <div className={styles.plusIcon}>+</div>
              </div>
              <div className={styles.addText}>
                <span className={styles.addTitle}>새 앨범 만들기</span>
                <span className={styles.addSubtitle}>새로운 추억을 시작하세요</span>
              </div>
            </Link>
          </div>

          {/* Loading Visual Hint - Only shown during initial load or fetch */}
          {isLoading && (
            <div className={styles.loadingHint}>
              <div className={styles.dotContainer}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
              <span className={styles.loadingText}>더 많은 추억을 불러오는 중...</span>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
