"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase_new/client';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './page.module.css';

interface AlbumClientProps {
  initialPosts: any[];
  settings: {
    albumFont: string;
    albumFontSize: number;
    albumAlign: string;
    showAlbumTitle: boolean;
  };
}

export default function AlbumClient({ initialPosts, settings }: AlbumClientProps) {
  const [posts] = useState<any[]>(initialPosts);
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      const fetchLikes = async () => {
        const { data, error } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        
        if (!error && data) {
          setUserLikes(data.map(l => l.post_id));
        }
      };
      fetchLikes();
    } else {
      setUserLikes([]);
    }
  }, [user, supabase]);

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

  const handleToggleFavorite = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('좋아요를 하시려면 로그인이 필요합니다.');
      return;
    }

    const isLiked = userLikes.includes(postId);

    if (isLiked) {
      setUserLikes(prev => prev.filter(id => id !== postId));
    } else {
      setUserLikes(prev => [...prev, postId]);
    }

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        await supabase
          .from('post_likes')
          .insert({ user_id: user.id, post_id: postId });
      }
    } catch (err) {
      console.error('Error updating favorite status:', err);
      if (isLiked) {
        setUserLikes(prev => [...prev, postId]);
      } else {
        setUserLikes(prev => prev.filter(id => id !== postId));
      }
    }
  };

  const sortedPosts = getSortedPosts();

  const filteredPosts = sortedPosts.filter(post => {
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = post.title.toLowerCase().includes(query);
    const tagsMatch = post.tags && Array.isArray(post.tags) 
      ? post.tags.some((tag: string) => tag.toLowerCase().includes(query))
      : false;
    
    const favoriteMatch = !onlyFavorites || userLikes.includes(post.id);
    
    return (titleMatch || tagsMatch) && favoriteMatch;
  });

  return (
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
        <div className={styles.grid} style={{ '--grid-cols': gridCols } as any}>
          {filteredPosts.map((post) => {
            const cardUrl = post.google_photos_link || `/post/${post.id}`;
            const isExternal = !!post.google_photos_link;

            return (
              <Link 
                key={post.id} 
                href={cardUrl} 
                target={isExternal ? "_blank" : "_self"}
                className={styles.card}
              >
                <div className={styles.cardImageWrapper}>
                  {post.thumbnail_url ? (
                    <Image 
                      src={post.thumbnail_url} 
                      alt={post.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={styles.cardImage}
                      style={{ objectFit: 'cover' }}
                    />
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
                    {settings.showAlbumTitle && (
                      <h3 
                        className={styles.cardTitle}
                        style={{ 
                          fontFamily: settings.albumFont,
                          fontSize: `${settings.albumFontSize}px`,
                          textAlign: albumAlignProps.textAlign as any,
                          flex: 1
                        }}
                      >
                        {post.title}
                      </h3>
                    )}
                    <div 
                      className={styles.heartBtn}
                      onClick={(e) => handleToggleFavorite(e, post.id)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={userLikes.includes(post.id) ? "#E6A8A8" : "none"} stroke={userLikes.includes(post.id) ? "#E6A8A8" : "#D0CCD3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                  </div>

                  <div className={styles.tagList}>
                    {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string, i: number) => (
                      <span key={i} className={styles.tagItem}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}

          <Link href="/settings" className={styles.addCard}>
            <div className={styles.addIconWrapper}>
              <div className={styles.plusIcon}>+</div>
            </div>
            <div className={styles.addText}>
              <span className={styles.addTitle}>관리 및 추가</span>
              <span className={styles.addSubtitle}>기록 관리 페이지로 이동</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
