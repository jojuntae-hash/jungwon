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
      {/* Left: Logo (Removed per request, kept empty div for centering) */}
      <div className={styles.logoSpacer}></div>

      {/* Center: Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={styles.navLink}
              style={{
                fontWeight: isActive ? '700' : '500',
                color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
                opacity: isActive ? 1 : 0.6,
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Right: User Icon */}
      <div>
        {loading ? (
          <div style={{ width: '32px', height: '32px' }}></div>
        ) : user ? (
          <div className={styles.userIconContainer}>
            <button 
              onClick={signOut}
              title="로그아웃"
              className={styles.profileBtn}
              style={{ color: '#FF4D4D', borderColor: '#FF4D4D' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className={styles.btnText}>로그아웃</span>
            </button>
          </div>
        ) : (
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <button 
              className={styles.profileBtn}
              title="로그인"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span className={styles.btnText}>로그인</span>
            </button>
          </Link>
        )
}
      </div>
    </header>
  );
}
