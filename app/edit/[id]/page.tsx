"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from '../../record/record.module.css';

export default function EditPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const { user } = useAuth();
  const router = useRouter();

  // Show preview if image is selected or fetched
  const showPreview = thumbnailPreview !== '';

  useEffect(() => {
    if (!id) return;
    
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) {
        // Only allow author to edit (rudimentary check, RLS should handle real security)
        if (user && data.user_id !== user.id) {
          alert("수정 권한이 없습니다.");
          router.push('/');
          return;
        }
        
        setTitle(data.title);
        setLink(data.google_photos_link || '');
        setContent(data.content);
        setTags(data.tags || []);
        if (data.thumbnail_url) {
          setThumbnailPreview(data.thumbnail_url);
        }
      } else if (error) {
        console.error("Error fetching post:", error);
        alert("글을 불러오지 못했습니다.");
        router.push('/');
      }
      setIsLoading(false);
    };
    
    if (user) {
      fetchPost();
    } else {
      // If user auth state isn't loaded yet, wait.
      // In a real app we might watch `user` and only fetch when it's ready.
      // For now, let's just fetch if user is loaded. 
      // If user is null but still loading, this might fail, so we'll wait for user.
    }
  }, [id, user, router]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      e.preventDefault();
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsPublishing(true);

    try {
      let thumbnailUrl = thumbnailPreview;
      
      // Upload thumbnail only if user selected a new file
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(filePath, thumbnailFile);
          
        if (uploadError) {
          console.error("Upload error", uploadError);
          alert("썸네일 업로드 실패: " + uploadError.message);
          setIsPublishing(false);
          return;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(filePath);
          
        thumbnailUrl = publicUrl;
      }

      // Update post data
      const { data, error } = await supabase
        .from('posts')
        .update({
          title,
          google_photos_link: link,
          content,
          tags,
          thumbnail_url: thumbnailUrl
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating post:", error);
        alert(`수정 중 오류가 발생했습니다: ${error.message}`);
      } else if (data && data.length === 0) {
        alert("수정 권한이 없거나 데이터베이스(Supabase) 보안 정책(UPDATE Policy)이 설정되지 않아 수정이 반영되지 않았습니다. (SQL Editor에서 정책을 추가해주세요)");
      } else {
        alert("성공적으로 수정되었습니다!");
        router.push(`/post/${id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return <div className={styles.container} style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={styles.container}>
      {/* Left Panel: Form */}
      <div className={styles.leftPanel}>
        <div className={styles.card}>
          <div className={styles.formHeader}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            오늘의 추억 수정하기
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>기록 제목</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="예: 첫 걸음마를 뗀 날" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Google Photos 링크</label>
            <div className={styles.linkInputWrapper}>
              <svg className={styles.linkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <input 
                type="text" 
                className={`${styles.input} ${styles.linkInput}`} 
                placeholder="https://photos.app.goo.gl/..." 
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>앨범 커버 (썸네일) 사진 업로드 (변경시에만 선택)</label>
            <input 
              type="file" 
              accept="image/*"
              className={styles.fileInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setThumbnailFile(file);
                  setThumbnailPreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>하고 싶은 이야기</label>
            <textarea 
              className={styles.textarea} 
              placeholder="아이의 미소와 오늘의 따뜻한 순간을 적어주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className={styles.tagsContainer}>
            {tags.map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                #{tag}
                <button type="button" className={styles.removeTagBtn} onClick={() => removeTag(idx)}>✕</button>
              </span>
            ))}
            
            {isAddingTag ? (
              <input 
                type="text" 
                className={styles.input} 
                style={{ width: '120px', padding: '6px 12px', height: 'auto' }}
                placeholder="태그 입력 후 Enter"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                onBlur={() => setIsAddingTag(false)}
                autoFocus
              />
            ) : (
              <button type="button" className={styles.addTagBtn} onClick={() => setIsAddingTag(true)}>
                + 태그 추가
              </button>
            )}
          </div>
        </div>

        <div className={styles.actionRow}>
          <button type="button" className={styles.btnText} onClick={() => router.back()}>
            취소
          </button>
          
          <div className={styles.primaryActions}>
            <button type="button" className={styles.btnPrimary} onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? '수정 중...' : '수정 완료'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview & Tips */}
      <div className={styles.rightPanel}>
        <div>
          <div className={styles.previewHeader}>
            미리보기
          </div>

          <div className={styles.previewCard}>
            <div className={styles.previewImageWrapper}>
              {showPreview ? (
                <img src={thumbnailPreview} alt="Preview" className={styles.previewImage} />
              ) : (
                <span>이미지 업로드시<br/>미리보기가 표시됩니다</span>
              )}
            </div>

            <div className={styles.placeholderLines}>
              <div className={styles.line} style={{ width: '80%' }}></div>
              <div className={styles.line} style={{ width: '100%' }}></div>
              <div className={styles.line} style={{ width: '100%' }}></div>
              <div className={styles.line} style={{ width: '60%' }}></div>
            </div>

            <div className={styles.previewFooter}>
              <span className={styles.previewDate}>{today}</span>
              <span className={styles.previewLogo}>Garden</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
