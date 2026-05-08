"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase_new/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/app/components/Header';
import styles from '../../record/record.module.css';

export default function EditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const supabase = createClient();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  // Cropping state
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageAspect, setImageAspect] = useState(1);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      alert("로그인이 필요한 서비스입니다.");
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // 2. Fetch post data
  useEffect(() => {
    if (!id || !user) return;
    
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();
          
        if (data) {
          const isOwner = user && data.user_id === user.id;
          if (!isOwner && !isAdmin) {
            alert("수정 권한이 없습니다.");
            router.push('/');
            return;
          }
          
          setTitle(data.title || '');
          setLink(data.google_photos_link || '');
          setContent(data.content || '');
          setTags(data.tags || []);
          if (data.thumbnail_url) {
            setThumbnailPreview(data.thumbnail_url);
            
            const img = new Image();
            img.crossOrigin = "anonymous"; // Handle CORS for editing existing images
            img.onload = () => setImageAspect(img.width / img.height);
            img.src = data.thumbnail_url;
          }
        } else if (error) {
          console.error("Error fetching post:", error);
          alert("글을 불러오지 못했습니다.");
          router.push('/');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [id, user, isAdmin, router, supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      setZoom(1);
      setPosition({ x: 50, y: 50 });

      const img = new Image();
      img.onload = () => setImageAspect(img.width / img.height);
      img.src = objectUrl;
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Common drag/touch logic
  const startDragging = (clientX: number, clientY: number) => {
    if (!thumbnailPreview) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const moveDragging = (clientX: number, clientY: number) => {
    if (!isDragging || !thumbnailPreview) return;
    const dx = ((clientX - dragStart.x) / 300) * 100;
    const dy = ((clientY - dragStart.y) / 225) * 100;
    setPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx / zoom)),
      y: Math.max(0, Math.min(100, prev.y - dy / zoom))
    }));
    setDragStart({ x: clientX, y: clientY });
  };

  const stopDragging = () => setIsDragging(false);

  const handlePublish = async () => {
    if (!title) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsPublishing(true);

    try {
      let thumbnailUrl = thumbnailPreview;
      
      // Upload new thumbnail if file changed OR if existing image was cropped (zoom/pos changed)
      const isImageEdited = thumbnailFile || zoom !== 1 || position.x !== 50 || position.y !== 50;

      if (isImageEdited && thumbnailPreview) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = thumbnailPreview;
        
        await new Promise((resolve, reject) => { 
          img.onload = resolve; 
          img.onerror = () => reject(new Error("이미지를 불러오는 중 오류가 발생했습니다. (CORS)"));
        });

        canvas.width = 1200;
        canvas.height = 900;

        if (ctx) {
          let dWidth, dHeight;
          const imgAspect = img.width / img.height;
          const canvasAspect = 1200 / 900;
          
          if (imgAspect > canvasAspect) {
            dHeight = 900 * zoom;
            dWidth = dHeight * imgAspect;
          } else {
            dWidth = 1200 * zoom;
            dHeight = dWidth / imgAspect;
          }

          const dx = (1200 - dWidth) * (position.x / 100);
          const dy = (900 - dHeight) * (position.y / 100);

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1200, 900);
          ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dWidth, dHeight);
          
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
          });

          if (blob) {
            const fileName = `edit_${Date.now()}_thumbnail.jpg`;
            const { error: uploadError } = await supabase.storage
              .from('thumbnails')
              .upload(fileName, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('thumbnails')
              .getPublicUrl(fileName);
            
            thumbnailUrl = publicUrl;
          }
        }
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

      if (error) throw error;
      if (data && data.length === 0) throw new Error("수정 권한이 없습니다.");

      alert('성공적으로 수정되었습니다!');
      router.push(`/album`); // Redirect to album or post
    } catch (err: any) {
      console.error(err);
      alert('수정 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const hasPreview = thumbnailPreview !== '';

  if (isLoading || authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6B5B7B' }}>로딩 중...</div>;
  }

  return (
    <div style={{ backgroundColor: '#F9F8F6', minHeight: '100vh' }}>
      <Header />
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.formHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            오늘의 추억 수정하기
          </div>

          <div className={styles.card}>
            <div className={styles.formGroup}>
              <label className={styles.label}>정원 기록 제목</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="제목을 입력하세요"
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
              <label className={styles.label}>앨범 커버 (썸네일) 업로드 (변경 시에만 선택)</label>
              <input 
                type="file" 
                accept="image/*" 
                className={styles.fileInput}
                onChange={handleImageChange}
              />
              {hasPreview && (
                <div className={styles.zoomControl}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={styles.label}>확대/축소</label>
                    <span style={{ fontSize: '12px', color: '#9D4EDD', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    step="0.01" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              )}
            </div>

            {/* Mobile Preview Panel (Shown on mobile) */}
            <div className={styles.mobilePreviewSection}>
              <div className={styles.previewHeader}>실시간 미리보기 (드래그하여 구도 조정)</div>
              <div className={styles.previewCard} style={{ transform: 'none' }}>
                <div 
                  className={styles.previewImageWrapper}
                  onMouseDown={(e) => startDragging(e.clientX, e.clientY)}
                  onMouseMove={(e) => moveDragging(e.clientX, e.clientY)}
                  onMouseUp={stopDragging}
                  onMouseLeave={stopDragging}
                  onTouchStart={(e) => startDragging(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e) => moveDragging(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={stopDragging}
                  style={{ cursor: 'move', touchAction: 'none' }}
                >
                  {hasPreview ? (
                    <div 
                      className={styles.previewImageContainer}
                      style={{
                        backgroundSize: imageAspect > (4/3) ? `auto ${zoom * 100}%` : `${zoom * 100}% auto`,
                        backgroundPosition: `${position.x}% ${position.y}%`,
                        backgroundImage: `url(${thumbnailPreview})`
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#D0CCD3' }}>이미지 없음</div>
                  )}
                  <div className={styles.cropGuide}>상하좌우 드래그하여 위치 조절</div>
                </div>
                <div className={styles.placeholderLines}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#4A3C59' }}>{title || '제목 없음'}</div>
                </div>
                <div className={styles.previewFooter}>
                  <span className={styles.previewDate}>{today}</span>
                  <span className={styles.previewLogo}>Garden</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>남기고 싶은 이야기</label>
              <textarea 
                className={styles.textarea} 
                placeholder="내용을 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className={styles.tagsContainer}>
              {tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>
                  #{tag}
                  <button type="button" className={styles.removeTagBtn} onClick={() => removeTag(idx)}>X</button>
                </span>
              ))}
              {isAddingTag ? (
                <input 
                  type="text" 
                  className={styles.input} 
                  style={{ width: '120px', padding: '6px 12px', height: 'auto' }}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={() => setIsAddingTag(false)}
                  autoFocus
                />
              ) : (
                <button type="button" className={styles.addTagBtn} onClick={() => setIsAddingTag(true)}>+ 태그 추가</button>
              )}
            </div>
          </div>

          <div className={styles.actionRow}>
            <button type="button" className={styles.btnText} onClick={() => router.back()}>취소</button>
            <div className={styles.primaryActions}>
              <button type="button" className={styles.btnPrimary} onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? '수정 중..' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Preview Panel (Shown on desktop) */}
        <div className={styles.rightPanel}>
          <div className={styles.desktopPreviewWrapper}>
            <div className={styles.previewHeader}>실시간 미리보기</div>
            <div className={styles.previewCard}>
              <div 
                className={styles.previewImageWrapper}
                onMouseDown={(e) => startDragging(e.clientX, e.clientY)}
                onMouseMove={(e) => moveDragging(e.clientX, e.clientY)}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
                style={{ cursor: 'move' }}
              >
                {hasPreview ? (
                  <div 
                    className={styles.previewImageContainer}
                    style={{
                      backgroundSize: imageAspect > (4/3) ? `auto ${zoom * 100}%` : `${zoom * 100}% auto`,
                      backgroundPosition: `${position.x}% ${position.y}%`,
                      backgroundImage: `url(${thumbnailPreview})`
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#D0CCD3' }}>이미지 없음</div>
                )}
                <div className={styles.cropGuide}>드래그하여 위치 조절</div>
              </div>
              <div className={styles.placeholderLines}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#4A3C59' }}>{title || '제목 없음'}</div>
              </div>
              <div className={styles.previewFooter}>
                <span className={styles.previewDate}>{today}</span>
                <span className={styles.previewLogo}>Garden</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
