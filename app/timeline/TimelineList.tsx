'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase_new/client';
import styles from './page.module.css';

interface Post {
  id: string;
  title: string;
  thumbnail_url: string | null;
  google_photos_link: string | null;
  created_at: string;
}

interface TimelineListProps {
  initialPosts: Post[];
  fontFamily: string;
}

const PAGE_SIZE = 10;

export default function TimelineList({ initialPosts, fontFamily }: TimelineListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('title', { ascending: false }) // 기존 정렬 방식 유지
        .range(from, to);

      if (error) throw error;

      if (data && data.length > 0) {
        setPosts(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, supabase]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchMorePosts, hasMore, isLoading]);

  return (
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
                    priority={index < 4}
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

      {/* 무한 스크롤 감지 포인트 */}
      <div ref={observerTarget} className={styles.loadingContainer}>
        {isLoading && (
          <div className={styles.loader}>
            <div className={styles.loaderDot} />
            <div className={styles.loaderDot} />
            <div className={styles.loaderDot} />
          </div>
        )}
      </div>
    </div>
  );
}
