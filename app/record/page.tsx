"use client";

export const runtime = 'edge';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/app/components/Header';
import styles from './record.module.css';

export default function RecordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Center by default
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isPublishing, setIsPublishing] = useState(false);
  const [imageAspect, setImageAspect] = useState(1);

  // 1. Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      setZoom(1);
      setPosition({ x: 50, y: 50 });

      // Get image aspect ratio
      const img = new Image();
      img.onload = () => {
        setImageAspect(img.width / img.height);
      };
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

  const handlePublish = async () => {
    if (!title) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!thumbnailFile) {
      alert('앨범 커버 이미지를 업로드해주세요.');
      return;
    }

    setIsPublishing(true);

    try {
      let thumbnailUrl = '';
      
      // 1. Process and Upload thumbnail if exists
      if (thumbnailFile) {
        // Create a canvas to crop the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.src = thumbnailPreview;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Set output size to 1200x900 (4:3)
        canvas.width = 1200;
        canvas.height = 900;

        if (ctx) {
          // Calculate the size the image should be on the 1200x900 canvas
          let dWidth, dHeight;
          const imgAspect = img.width / img.height;
          const canvasAspect = 1200 / 900;
          
          if (imgAspect > canvasAspect) {
            // Image is wider than 4:3
            dHeight = 900 * zoom;
            dWidth = dHeight * imgAspect;
          } else {
            // Image is taller than 4:3
            dWidth = 1200 * zoom;
            dHeight = dWidth / imgAspect;
          }

          // Calculate destination coordinates matching CSS background-position: X% Y%
          // offset = (containerSize - imageSize) * (percent / 100)
          const dx = (1200 - dWidth) * (position.x / 100);
          const dy = (900 - dHeight) * (position.y / 100);

          // Fill background for out-of-bounds areas (when zoom < 1)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1200, 900);
          
          ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dWidth, dHeight);
          
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
          });

          if (blob) {
            const fileName = `${Date.now()}_thumbnail.jpg`;
            const { data: uploadData, error: uploadError } = await supabase.storage
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

      // 2. Save post to Supabase
      const { error } = await supabase.from('posts').insert({
        title,
        link,
        content,
        thumbnail_url: thumbnailUrl,
        tags,
        author_id: user?.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert('성공적으로 발행되었습니다!');
      router.push('/album');
    } catch (err: any) {
      console.error(err);
      alert('발행 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const showPreview = thumbnailPreview !== '';

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6B5B7B' }}>로딩 중...</div>;
  }

  return (
    <div style={{ backgroundColor: '#F9F8F6', minHeight: '100vh' }}>
      <Header />
      <div className={styles.container}>
        {/* Left Panel: Inputs */}
        <div className={styles.leftPanel}>
          <div className={styles.formHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            새로운 정원 기록하기
          </div>

          <div className={styles.card}>
            <div className={styles.formGroup}>
              <label className={styles.label}>정원 기록 제목</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="오늘의 소중한 순간에 이름을 붙여주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>관련 링크 (선택사항)</label>
              <div className={styles.linkInputWrapper}>
                <svg className={styles.linkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <input 
                  type="text" 
                  className={`${styles.input} ${styles.linkInput}`} 
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>앨범 커버 (썸네일) 사진 업로드 (권장 비율 4:3)</label>
              <input 
                type="file" 
                accept="image/*" 
                className={styles.fileInput}
                onChange={handleImageChange}
              />
              {thumbnailPreview && (
                <div className={styles.zoomControl}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={styles.label}>확대/축소</label>
                    <span style={{ fontSize: '12px', color: '#9D4EDD', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3" 
                    step="0.1" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              )}
            </div>

            {/* Mobile-optimized Preview Placement */}
            <div className={styles.mobilePreviewSection}>
              <div className={styles.previewHeader}>
                실시간 미리보기
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>

              <div className={styles.previewCard}>
                <div 
                  className={styles.previewImageWrapper}
                  onMouseDown={(e) => {
                    if (!showPreview) return;
                    setIsDragging(true);
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging || !showPreview) return;
                    const dx = ((e.clientX - dragStart.x) / 300) * 100;
                    const dy = ((e.clientY - dragStart.y) / 225) * 100;
                    setPosition(prev => ({
                      x: Math.max(0, Math.min(100, prev.x - dx / zoom)),
                      y: Math.max(0, Math.min(100, prev.y - dy / zoom))
                    }));
                    setDragStart({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  style={{ cursor: showPreview ? 'move' : 'default' }}
                >
                  {showPreview ? (
                    <div 
                      className={styles.previewImageContainer}
                      style={{
                        backgroundSize: imageAspect > (4/3) ? `auto ${zoom * 100}%` : `${zoom * 100}% auto`,
                        backgroundPosition: `${position.x}% ${position.y}%`,
                        backgroundImage: `url(${thumbnailPreview})`
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#D0CCD3' }}>
                      <span>이미지 업로드 시<br/>미리보기가 표시됩니다</span>
                    </div>
                  )}
                  {showPreview && (
                    <div className={styles.heartBtn}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#E6A8A8" stroke="#E6A8A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </div>
                  )}
                  {showPreview && <div className={styles.cropGuide}>이미지를 드래그하여 위치 조절</div>}
                </div>

                <div className={styles.placeholderLines}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    color: '#4A3C59',
                    minHeight: '24px'
                  }}>
                    {title || '앨범 제목이 여기에 표시됩니다'}
                  </div>
                  <div className={styles.line} style={{ width: '100%', opacity: 0.5 }}></div>
                  <div className={styles.line} style={{ width: '80%', opacity: 0.5 }}></div>
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
                placeholder="아이의 미소나 하늘의 따뜻한 순간을 담아주세요.."
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
            <button type="button" className={styles.btnText} onClick={() => {setTitle(''); setLink(''); setContent(''); setThumbnailFile(null); setThumbnailPreview('');}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              초안 삭제
            </button>
            
            <div className={styles.primaryActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => router.back()}>
                취소하기
              </button>
              <button type="button" className={styles.btnPrimary} onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? '발행 중..' : '발행하기'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Tips */}
        <div className={styles.rightPanel}>
          <div className={styles.desktopPreviewWrapper}>
            <div className={styles.previewHeader}>
              실시간 미리보기
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>

            <div className={styles.previewCard}>
              <div 
                className={styles.previewImageWrapper}
                onMouseDown={(e) => {
                  if (!showPreview) return;
                  setIsDragging(true);
                  setDragStart({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                  if (!isDragging || !showPreview) return;
                  const dx = ((e.clientX - dragStart.x) / 300) * 100;
                  const dy = ((e.clientY - dragStart.y) / 225) * 100;
                  setPosition(prev => ({
                    x: Math.max(0, Math.min(100, prev.x - dx / zoom)),
                    y: Math.max(0, Math.min(100, prev.y - dy / zoom))
                  }));
                  setDragStart({ x: e.clientX, y: e.clientY });
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                style={{ cursor: showPreview ? 'move' : 'default' }}
              >
                {showPreview ? (
                  <div 
                    className={styles.previewImageContainer}
                    style={{
                      backgroundSize: imageAspect > (4/3) ? `auto ${zoom * 100}%` : `${zoom * 100}% auto`,
                      backgroundPosition: `${position.x}% ${position.y}%`,
                      backgroundImage: `url(${thumbnailPreview})`
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#D0CCD3' }}>
                    <span>이미지 업로드 시<br/>미리보기가 표시됩니다</span>
                  </div>
                )}
                {showPreview && (
                  <div className={styles.heartBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E6A8A8" stroke="#E6A8A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </div>
                )}
                {showPreview && <div className={styles.cropGuide}>이미지를 드래그하여 위치 조절</div>}
              </div>

              <div className={styles.placeholderLines}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 700, 
                  color: '#4A3C59',
                  minHeight: '24px'
                }}>
                  {title || '앨범 제목이 여기에 표시됩니다'}
                </div>
                <div className={styles.line} style={{ width: '100%', opacity: 0.5 }}></div>
                <div className={styles.line} style={{ width: '80%', opacity: 0.5 }}></div>
              </div>

              <div className={styles.previewFooter}>
                <span className={styles.previewDate}>{today}</span>
                <span className={styles.previewLogo}>Garden</span>
              </div>
            </div>
          </div>

          <div className={styles.tipBox}>
            <div className={styles.tipTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21h6"></path>
                <path d="M12 17v4"></path>
                <path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path>
              </svg>
              기록 팁
            </div>
            <div className={styles.tipContent}>
              사진뿐만 아니라 그날의 온도나 분위기가 어땠는지 구체적인 글귀를 남겨보세요. 나중에 꺼내볼 때 더 큰 감동으로 다가올 거예요.
            </div>
            <div className={styles.floatingIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                <path d="M2 2l7.586 7.586"></path>
                <circle cx="11" cy="11" r="2"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
