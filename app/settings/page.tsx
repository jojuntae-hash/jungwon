"use client";

export const runtime = 'edge';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import { createClient } from '@/lib/supabase_new/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { themes } from '@/lib/themes';
import { fontOptions } from '@/lib/fonts';
import styles from './page.module.css';

// --- Icons ---
const ThemeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
const FontIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
const ImageIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const TextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
);

const AlbumIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
);

const AlignLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
);

const AlignCenter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
);

const AlignRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
);

const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const supabase = createClient();
  
  // Authentication check is now handled by middleware.ts for better security.

  // Settings state
  const [selectedTheme, setSelectedTheme] = useState<string>('classic-garden');
  const [selectedFont, setSelectedFont] = useState<string>('noto-sans');
  const [bannerText, setBannerText] = useState('조정원의 정원');
  const [bannerPos, setBannerPos] = useState('left');
  const [bannerFontSize, setBannerFontSize] = useState(48);
  const [bannerImage, setBannerImage] = useState('/images/hero_banner.png');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [albumFontSize, setAlbumFontSize] = useState(18);
  const [albumAlign, setAlbumAlign] = useState('left');
  const [showAlbumTitle, setShowAlbumTitle] = useState(true);

  const [homeAlbumFontSize, setHomeAlbumFontSize] = useState(20);
  const [homeAlbumAlign, setHomeAlbumAlign] = useState('left');
  const [homeShowAlbumTitle, setHomeShowAlbumTitle] = useState(true);

  const [showBanner, setShowBanner] = useState(true);

  // New: Post selection state
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [selectedHomePosts, setSelectedHomePosts] = useState<string[]>([]);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const fontRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings and posts on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'global')
          .single();

        if (data && !error) {
          setSelectedTheme(data.theme || 'classic-garden');
          setSelectedFont(data.font_family || 'noto-sans');
          setBannerText(data.banner_text || '');
          setBannerPos(data.banner_pos || 'left');
          setBannerFontSize(data.banner_font_size || 48);
          setBannerImage(data.banner_image_url || '/images/hero_banner.png');
          setAlbumFontSize(data.album_font_size || 18);
          setAlbumAlign(data.album_align || 'left');
          setShowAlbumTitle(data.show_album_title ?? true);
          
          setHomeAlbumFontSize(data.home_album_font_size || 20);
          setHomeAlbumAlign(data.home_album_align || 'left');
          setHomeShowAlbumTitle(data.home_show_album_title ?? true);

          setSelectedHomePosts(data.selected_home_posts || []);
          setShowBanner(data.show_banner ?? true);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    const fetchAllPosts = async () => {
      setIsPostsLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, created_at')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setAllPosts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsPostsLoading(false);
      }
    };

    fetchSettings();
    fetchAllPosts();

    // Click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (fontRef.current && !fontRef.current.contains(event.target as Node)) {
        setIsFontOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalBannerUrl = bannerImage;

      // 1. Upload new banner image if selected
      if (bannerFile) {
        const fileName = `banner_${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, bannerFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('site-assets')
          .getPublicUrl(fileName);
        
        finalBannerUrl = publicUrl;
      }

      // 2. Save settings to Supabase
      const { error } = await supabase.from('site_settings').upsert({
        id: 'global',
        theme: selectedTheme,
        font_family: selectedFont,
        banner_text: bannerText,
        banner_pos: bannerPos,
        banner_font_size: bannerFontSize,
        banner_image_url: finalBannerUrl,
        album_font_size: albumFontSize,
        album_align: albumAlign,
        show_album_title: showAlbumTitle,
        home_album_font_size: homeAlbumFontSize,
        home_album_align: homeAlbumAlign,
        home_show_album_title: homeShowAlbumTitle,
        selected_home_posts: selectedHomePosts.filter(id => allPosts.some(p => p.id === id)),
        show_banner: showBanner,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert('설정이 성공적으로 저장되었습니다.');
      router.push('/');
    } catch (err: any) {
      console.error(err);
      alert('설정 저장 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePostSelection = (postId: string) => {
    setSelectedHomePosts(prev => {
      // Filter out IDs that no longer exist in allPosts
      const currentValid = prev.filter(id => allPosts.some(p => p.id === id));
      
      if (currentValid.includes(postId)) {
        return currentValid.filter(id => id !== postId);
      } else {
        if (currentValid.length >= 8) {
          alert('최대 8개까지만 선택할 수 있습니다.');
          return currentValid;
        }
        return [...currentValid, postId];
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.card}>
          {/* 0. 디자인 테마 설정 */}
          <section 
            className={styles.section}
            style={{ zIndex: (isThemeOpen || isFontOpen) ? 50 : 1 }}
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}><ThemeIcon /></span>
              <h2 className={styles.sectionTitle}>디자인 테마 설정</h2>
            </div>
            
            <div className={styles.themeSettingWrapper}>
              <div className={styles.themeSelectorColumn}>
                <div 
                  ref={themeRef}
                  className={styles.customSelectWrapper} 
                  style={{ zIndex: isThemeOpen ? 1000 : 10 }}
                >
                  <div 
                    className={`${styles.customSelect} ${isThemeOpen ? styles.customSelectOpen : ''}`}
                    onClick={() => setIsThemeOpen(!isThemeOpen)}
                  >
                    <div className={styles.selectedThemeInfo}>
                      <div className={styles.themeSwatchSmall} style={{ background: themes.find(t => t.id === selectedTheme)?.primary }}>
                        <div className={styles.themeSwatchInnerSmall} style={{ background: themes.find(t => t.id === selectedTheme)?.secondary }} />
                      </div>
                      <span className={styles.selectedThemeName}>{themes.find(t => t.id === selectedTheme)?.name}</span>
                    </div>
                    <svg className={styles.selectArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>

                  {isThemeOpen && (
                    <div className={styles.themeDropdown}>
                      {themes.map((theme) => (
                        <div 
                          key={theme.id} 
                          className={`${styles.themeOption} ${selectedTheme === theme.id ? styles.themeOptionActive : ''}`}
                          onClick={() => {
                            setSelectedTheme(theme.id);
                            setIsThemeOpen(false);
                          }}
                        >
                          <div className={styles.themeSwatchSmall} style={{ background: theme.primary }}>
                            <div className={styles.themeSwatchInnerSmall} style={{ background: theme.secondary }} />
                          </div>
                          <div className={styles.themeOptionText}>
                            <span className={styles.themeNameLabel}>{theme.name}</span>
                            <span className={styles.themeDescSmall}>{theme.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className={styles.themeDescriptionLarge}>
                  {themes.find(t => t.id === selectedTheme)?.description}
                </p>

                {/* Font Selection Integrated Here */}
                <div className={styles.integratedFontSetting}>
                  <div className={styles.settingLabelSmall}>폰트 스타일</div>
                  <div 
                    ref={fontRef}
                    className={styles.customSelectWrapper}
                    style={{ zIndex: isFontOpen ? 1000 : 5 }}
                  >
                    <div 
                      className={`${styles.customSelect} ${isFontOpen ? styles.customSelectOpen : ''}`}
                      onClick={() => setIsFontOpen(!isFontOpen)}
                    >
                      <div className={styles.selectedThemeInfo}>
                        <span className={styles.selectedThemeName}>
                          {fontOptions.find(f => f.id === selectedFont)?.name}
                        </span>
                      </div>
                      <svg className={styles.selectArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    {isFontOpen && (
                      <div className={styles.themeDropdown}>
                        {fontOptions.map((font) => (
                          <div 
                            key={font.id} 
                            className={`${styles.themeOption} ${selectedFont === font.id ? styles.themeOptionActive : ''}`}
                            onClick={() => {
                              setSelectedFont(font.id);
                              setIsFontOpen(false);
                            }}
                            style={{ fontFamily: font.family }}
                          >
                            <span className={styles.themeNameLabel} style={{ fontSize: '16px' }}>{font.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.themePreviewColumn}>
                <div className={styles.previewLabel}>실시간 미리보기</div>
                <div 
                  className={styles.themePreview}
                  style={{ 
                    '--p': themes.find(t => t.id === selectedTheme)?.primary,
                    '--s': themes.find(t => t.id === selectedTheme)?.secondary,
                    '--b': themes.find(t => t.id === selectedTheme)?.background,
                    '--t': themes.find(t => t.id === selectedTheme)?.text,
                    '--c': themes.find(t => t.id === selectedTheme)?.cardBg,
                    fontFamily: fontOptions.find(f => f.id === selectedFont)?.family,
                  } as any}
                >
                  <div className={styles.pvHeader}>
                    <div className={styles.pvCircle} />
                    <div className={styles.pvNav}>
                      <div className={styles.pvNavItem} />
                      <div className={styles.pvNavItem} />
                    </div>
                  </div>
                  <div className={styles.pvBanner}>
                    <div className={styles.pvBannerText}>Garden</div>
                  </div>
                  <div className={styles.pvGrid}>
                    <div className={styles.pvCard} />
                    <div className={styles.pvCard} />
                    <div className={styles.pvCard} />
                    <div className={styles.pvCard} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 1. 메인 배너 설정 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader} style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={styles.sectionIcon}><ImageIcon /></span>
                <h2 className={styles.sectionTitle}>메인 배너 설정</h2>
              </div>
              <div className={styles.toggleWrapper}>
                <label className={styles.label} style={{ marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={showBanner}
                    onChange={(e) => setShowBanner(e.target.checked)}
                    className={styles.checkbox}
                  />
                  홈 화면에 노출
                </label>
              </div>
            </div>
            <div className={styles.bannerSetting}>
              <div className={styles.bannerPreviewWrapper}>
                <div 
                  className={styles.bannerPreview} 
                  style={{ backgroundImage: `url(${bannerImage})` }}
                />
              </div>
              <div className={styles.bannerInfo}>
                <div className={styles.detailsCard}>
                  <span className={styles.detailsTitle}>현재 배너 상세 정보</span>
                  <span className={styles.detailsText}>권장 크기: 1200×350px</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <button className={styles.btnAction} onClick={triggerFileInput}>
                  <UploadIcon />
                  배너 이미지 변경
                </button>
              </div>
            </div>
          </section>

          {/* 2. 홈 앨범 카드 설정 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader} style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={styles.sectionIcon}><AlbumIcon /></span>
                <h2 className={styles.sectionTitle}>홈 앨범 카드 설정</h2>
              </div>
              <div className={styles.toggleWrapper}>
                <label className={styles.label} style={{ marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={homeShowAlbumTitle}
                    onChange={(e) => setHomeShowAlbumTitle(e.target.checked)}
                    className={styles.checkbox}
                  />
                  제목 노출
                </label>
              </div>
            </div>
            
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>텍스트 정렬</label>
                <div className={styles.segmentedControl}>
                  <button 
                    className={`${styles.segment} ${homeAlbumAlign === 'left' ? styles.segmentActive : ''}`}
                    onClick={() => setHomeAlbumAlign('left')}
                  >
                    <AlignLeft /> 좌측
                  </button>
                  <button 
                    className={`${styles.segment} ${homeAlbumAlign === 'center' ? styles.segmentActive : ''}`}
                    onClick={() => setHomeAlbumAlign('center')}
                  >
                    <AlignCenter /> 중앙
                  </button>
                  <button 
                    className={`${styles.segment} ${homeAlbumAlign === 'right' ? styles.segmentActive : ''}`}
                    onClick={() => setHomeAlbumAlign('right')}
                  >
                    <AlignRight /> 우측
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup} style={{ marginTop: '20px' }}>
              <div className={styles.sliderHeader}>
                <label className={styles.label}>카드 제목 크기</label>
                <span className={styles.sliderValue}>{homeAlbumFontSize}px</span>
              </div>
              <div className={styles.sliderWrapper}>
                <input 
                  type="range" 
                  min="10" 
                  max="32" 
                  className={styles.slider}
                  value={homeAlbumFontSize}
                  onChange={(e) => setHomeAlbumFontSize(parseInt(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* 3. 앨범 목록 카드 설정 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader} style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={styles.sectionIcon}><AlbumIcon /></span>
                <h2 className={styles.sectionTitle}>앨범 목록 카드 설정</h2>
              </div>
              <div className={styles.toggleWrapper}>
                <label className={styles.label} style={{ marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={showAlbumTitle}
                    onChange={(e) => setShowAlbumTitle(e.target.checked)}
                    className={styles.checkbox}
                  />
                  제목 노출
                </label>
              </div>
            </div>
            
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>텍스트 정렬</label>
                <div className={styles.segmentedControl}>
                  <button 
                    className={`${styles.segment} ${albumAlign === 'left' ? styles.segmentActive : ''}`}
                    onClick={() => setAlbumAlign('left')}
                  >
                    <AlignLeft /> 좌측
                  </button>
                  <button 
                    className={`${styles.segment} ${albumAlign === 'center' ? styles.segmentActive : ''}`}
                    onClick={() => setAlbumAlign('center')}
                  >
                    <AlignCenter /> 중앙
                  </button>
                  <button 
                    className={`${styles.segment} ${albumAlign === 'right' ? styles.segmentActive : ''}`}
                    onClick={() => setAlbumAlign('right')}
                  >
                    <AlignRight /> 우측
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup} style={{ marginTop: '20px' }}>
              <div className={styles.sliderHeader}>
                <label className={styles.label}>카드 제목 크기</label>
                <span className={styles.sliderValue}>{albumFontSize}px</span>
              </div>
              <div className={styles.sliderWrapper}>
                <input 
                  type="range" 
                  min="10" 
                  max="32" 
                  className={styles.slider}
                  value={albumFontSize}
                  onChange={(e) => setAlbumFontSize(parseInt(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* 4. 홈 화면 노출 앨범 선택 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}><AlbumIcon /></span>
              <h2 className={styles.sectionTitle}>홈 화면 노출 앨범 선택</h2>
            </div>
            
            <p className={styles.label} style={{ marginBottom: '15px', display: 'block' }}>
              홈 화면의 4x2 그리드에 노출될 앨범을 선택해 주세요. (최대 8개)
            </p>

            <div className={styles.postListWrapper}>
              <div className={styles.postList}>
                {isPostsLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', gridColumn: 'span 3', color: '#8C8C8C' }}>로딩 중...</div>
                ) : allPosts.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', gridColumn: 'span 3', color: '#8C8C8C' }}>작성된 글이 없습니다.</div>
                ) : (
                  allPosts.map((post) => {
                    const isSelected = selectedHomePosts.includes(post.id);
                    return (
                      <div 
                        key={post.id} 
                        className={`${styles.postItem} ${isSelected ? styles.postItemActive : ''}`}
                        onClick={() => togglePostSelection(post.id)}
                      >
                        <div className={styles.postCheckbox}>
                          {isSelected && <span className={styles.postCheckIcon}>✓</span>}
                        </div>
                        <span className={styles.postText}>{post.title}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className={styles.selectionInfo}>
              선택됨: {selectedHomePosts.filter(id => allPosts.some(p => p.id === id)).length} / 8
            </div>
          </section>

          <div className={styles.saveBar}>
            <button 
              className={styles.saveButton} 
              onClick={handleSave}
              disabled={isSaving}
            >
              <SaveIcon />
              <span>{isSaving ? '저장 중...' : '설정 저장'}</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
