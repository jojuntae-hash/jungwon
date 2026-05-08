"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase_new/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/app/components/Header';
import styles from './manage.module.css';

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    fetchPosts();
  }, [user, authLoading, router]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPosts(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' 기록을 정말 삭제하시겠습니까?`)) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('삭제 중 오류가 발생했습니다: ' + error.message);
    } else {
      alert('성공적으로 삭제되었습니다.');
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (authLoading || isLoading) {
    return <div className={styles.loading}>정원의 기록들을 불러오는 중...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>마스터 글 관리 🛠️</h1>
            <p className={styles.subtitle}>정원의 모든 소중한 조각들을 한곳에서 관리하세요.</p>
          </div>
          <Link href="/record">
            <button className={styles.addBtn}>+ 새 기록 추가</button>
          </Link>
        </div>

        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="제목 또는 태그로 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.countText}>총 {filteredPosts.length}개의 기록</span>
        </div>

        <div className={styles.listContainer}>
          {filteredPosts.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>썸네일</th>
                  <th>제목 / 링크 타입</th>
                  <th>작성일</th>
                  <th style={{ textAlign: 'right' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className={styles.row}>
                    <td>
                      <div className={styles.thumbWrapper}>
                        {post.thumbnail_url ? (
                          <Image src={post.thumbnail_url} alt="" fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className={styles.placeholder}>🖼️</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.postInfo}>
                        <span className={styles.postTitle}>{post.title}</span>
                        {post.google_photos_link ? (
                          <span className={styles.linkBadge}>외부 링크 연결 중 🔗</span>
                        ) : (
                          <span className={styles.internalBadge}>상세 페이지 연결 중 📄</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.dateText}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/edit/${post.id}`}>
                          <button className={styles.editBtn}>수정</button>
                        </Link>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(post.id, post.title)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              검색 결과가 없거나 등록된 기록이 없습니다. 🌿
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
