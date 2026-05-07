"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './Header.module.css';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: '홈', path: '/' },
    { name: '앨범', path: '/album' },
    { name: '기록하기', path: '/record' },
    { name: '설정', path: '/settings' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Left: Logo (Card Style) */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className={styles.logoCard}>
            Garden
          </div>
        </Link>

        {/* Center/Right: Navigation & Auth */}
        <div className={styles.navAndAuth}>
          <nav className={styles.nav}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={`${styles.navCard} ${isActive ? styles.navCardActive : ''}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className={styles.authSection}>
            {loading ? (
              <div style={{ width: '40px' }}></div>
            ) : user ? (
              <button 
                onClick={signOut}
                className={styles.authCard}
                style={{ color: '#E6A8A8' }}
                title="로그아웃"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className={styles.authText}>로그아웃</span>
              </button>
            ) : (
              <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                <button 
                  className={styles.authCard}
                  title="로그인"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  <span className={styles.authText}>로그인</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
