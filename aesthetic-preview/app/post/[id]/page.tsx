"use client";

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './post.module.css';

export default function PostDetail() {
  const { user, isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

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
    
    // Check if liked by current user
    const checkLike = async () => {
      if (user && id) {
        const { data, error } = await supabase
          .from('post_likes')
          .select('*')
          .eq('user_id', user.id)
          .eq('post_id', id)
          .single();
        
        if (!error && data) {
          setIsLiked(true);
        }
      }
    };
    checkLike();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user || !id) {
      alert('좋아요를 하시려면 로그인이 필요합니다.');
      return;
    }

    const nextStatus = !isLiked;
    setIsLiked(nextStatus);

    try {
      if (nextStatus) {
        await supabase
          .from('post_likes')
          .insert({ user_id: user.id, post_id: id });
      } else {
        await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', id);
      }
    } catch (err) {
      console.error('Error updating favorite status:', err);
      setIsLiked(!nextStatus);
      alert('좋아요 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 기록을 삭제하시겠습니까?')) return;

    try {
      // Check permission first
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !postData) {
        alert('이미 삭제된 게시글이거나 찾을 수 없습니다.');
        router.push('/album');
        return;
      }

      // Allow if owner OR admin
      const isOwner = user && postData.user_id === user.id;
      const canDelete = isOwner || isAdmin;

      if (!canDelete) {
        alert('본인이 작성한 글만 삭제할 수 있습니다.');
        return;
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('성공적으로 삭제되었습니다.');
      router.push('/album');
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert('삭제 중 오류가 발생했습니다: ' + err.message);
    }
  };

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
          <button 
            className={`${styles.heartBtn} ${isLiked ? styles.heartBtnActive : ''}`}
            onClick={handleToggleFavorite}
            title={isLiked ? "좋아요 취소" : "좋아요"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "#E6A8A8" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          <Link href={`/edit/${post.id}`}>
            <button className={styles.editBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              수정하기
            </button>
          </Link>

          <button className={styles.deleteBtn} onClick={handleDelete}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            삭제하기
          </button>
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
