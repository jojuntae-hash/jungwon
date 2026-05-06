"use client";

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './post.module.css';

export default function PostDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching post:", error);
      }
        
      if (data) {
        setPost(data);
      }
      setIsLoading(false);
    };
    
    fetchPost();
  }, [id]);

  if (isLoading) {
    return <div className={styles.container} style={{ textAlign: 'center', padding: '100px' }}>로딩중...</div>;
  }

  if (!post) {
    return <div className={styles.container} style={{ textAlign: 'center', padding: '100px' }}>글을 찾을 수 없습니다.</div>;
  }

  let albumLink = post.google_photos_link || '#';
  if (albumLink !== '#' && !albumLink.startsWith('http')) {
    albumLink = `https://${albumLink}`;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.content}>{post.content}</p>
        </div>
        
        <div className={styles.headerRight}>
          <Link href={`/edit/${post.id}`}>
            <button className={styles.editBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              수정하기
            </button>
          </Link>
        </div>
      </div>

      {post.thumbnail_url ? (
        <>
          <a 
            href={albumLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.googlePhotosBtn}
            onClick={(e) => {
              if (albumLink === '#') {
                e.preventDefault();
                alert('등록된 구글 포토 앨범 링크가 없습니다.');
              }
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '8px' }}>
              <path fill="#ea4335" d="M11 6a5 5 0 0 1 5 5v1h1a5 5 0 0 1 0 10h-1v-1a5 5 0 0 1-5-5V6z"/>
              <path fill="#4285f4" d="M13 18a5 5 0 0 1-5-5v-1H7a5 5 0 0 1 0-10h1v1a5 5 0 0 1 5 5v11z"/>
              <path fill="#fbbc05" d="M6 13a5 5 0 0 1 5-5h1v-1a5 5 0 0 1 10 0v1h-1a5 5 0 0 1-5 5H6z"/>
              <path fill="#34a853" d="M18 11a5 5 0 0 1-5 5h-1v1a5 5 0 0 1-10 0v-1h1a5 5 0 0 1 5-5h10z"/>
            </svg>
            구글 포토 앨범에서 보기
          </a>
          
          <div className={styles.albumSection}>
            <img src={post.thumbnail_url} alt="Album Thumbnail" className={styles.albumImage} />
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          썸네일 이미지가 없습니다.
        </div>
      )}
    </div>
  );
}
