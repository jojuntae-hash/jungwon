"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const HeaderExamples = () => {
  const [selected, setSelected] = useState(0);

  const menuItems = [
    { name: '홈', href: '/' },
    { name: '앨범', href: '/album' },
    { name: '기록하기', href: '/record' },
    { name: '설정', href: '/settings' },
  ];

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>상단 메뉴 디자인 예시 (5가지)</h1>
        <p style={{ textAlign: 'center', marginBottom: '60px', color: '#666' }}>원하시는 디자인을 선택하여 알려주세요.</p>

        {/* Example 1: Glassmorphism Floating */}
        <div style={{ marginBottom: '80px' }}>
          <h3 style={{ marginBottom: '20px', color: '#555' }}>1. 플로팅 글래스모피즘 (Floating Glassmorphism)</h3>
          <div style={{ 
            height: '150px', 
            backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '20px',
            position: 'relative',
            padding: '20px'
          }}>
            <nav style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              padding: '12px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              width: '90%',
              margin: '0 auto'
            }}>
              <div style={{ fontWeight: 800, fontSize: '20px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>JUNGWON</div>
              <div style={{ display: 'flex', gap: '24px' }}>
                {menuItems.map(item => (
                  <span key={item.name} style={{ color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>{item.name}</span>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Example 2: Minimalist Slim */}
        <div style={{ marginBottom: '80px' }}>
          <h3 style={{ marginBottom: '20px', color: '#555' }}>2. 미니멀리스트 슬림 (Minimalist Slim)</h3>
          <div style={{ 
            height: '150px', 
            backgroundColor: '#fff',
            borderRadius: '20px',
            position: 'relative',
            border: '1px solid #eee'
          }}>
            <nav style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0 40px',
              height: '60px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#9D4EDD', letterSpacing: '-0.5px' }}>Jungwon</div>
              <div style={{ display: 'flex', gap: '32px' }}>
                {menuItems.map(item => (
                  <span key={item.name} style={{ color: '#666', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s' }}>{item.name}</span>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Example 3: Centered Logo with Split Links */}
        <div style={{ marginBottom: '80px' }}>
          <h3 style={{ marginBottom: '20px', color: '#555' }}>3. 중앙 로고 & 스플릿 메뉴 (Centered Logo)</h3>
          <div style={{ 
            height: '150px', 
            backgroundColor: '#fff',
            borderRadius: '20px',
            position: 'relative',
            border: '1px solid #eee'
          }}>
            <nav style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px 0'
            }}>
              <div style={{ fontWeight: 900, fontSize: '24px', color: '#333', marginBottom: '10px' }}>JUNGWON</div>
              <div style={{ display: 'flex', gap: '40px', borderTop: '1px solid #eee', paddingTop: '10px', width: '100%', justifyContent: 'center' }}>
                {menuItems.map(item => (
                  <span key={item.name} style={{ color: '#888', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>{item.name}</span>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Example 4: Modern Dark Gradient */}
        <div style={{ marginBottom: '80px' }}>
          <h3 style={{ marginBottom: '20px', color: '#555' }}>4. 모던 다크 그라데이션 (Modern Dark)</h3>
          <div style={{ 
            height: '150px', 
            backgroundColor: '#1a1a2e',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <nav style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '20px 40px',
              background: 'linear-gradient(to right, #1a1a2e, #16213e)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #64FFDA, #48cae4)' }}></div>
                <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>Jungwon</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                {menuItems.map(item => (
                  <span key={item.name} style={{ 
                    color: '#e0e0e0', 
                    fontSize: '14px', 
                    padding: '8px 16px', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}>{item.name}</span>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Example 5: Soft & Playful (Card Style) */}
        <div style={{ marginBottom: '80px' }}>
          <h3 style={{ marginBottom: '20px', color: '#555' }}>5. 소프트 & 플레이풀 (Soft & Playful)</h3>
          <div style={{ 
            height: '150px', 
            backgroundColor: '#fdfcfe',
            borderRadius: '20px',
            position: 'relative',
            border: '1px solid #f0e6fa'
          }}>
            <nav style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '15px 30px',
              marginTop: '15px'
            }}>
              <div style={{ 
                padding: '10px 20px', 
                backgroundColor: '#F0E6FA', 
                borderRadius: '15px', 
                color: '#9D4EDD',
                fontWeight: 800,
                fontSize: '18px'
              }}>
                Garden
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {menuItems.map(item => (
                  <span key={item.name} style={{ 
                    color: '#4A3C59', 
                    fontSize: '14px', 
                    fontWeight: 700,
                    padding: '10px 20px',
                    borderRadius: '15px',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 12px rgba(157, 78, 221, 0.1)',
                    cursor: 'pointer'
                  }}>{item.name}</span>
                ))}
              </div>
            </nav>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/">
            <button style={{ 
              padding: '12px 30px', 
              backgroundColor: '#9D4EDD', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '30px', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}>메인으로 돌아가기</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeaderExamples;
