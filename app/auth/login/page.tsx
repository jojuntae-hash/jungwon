"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        {/* Left Side: Image */}
        <div className={styles.imageSection}>
          <div className={styles.imageOverlay} />
          <div className={styles.imageContent}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#4A3C59" opacity="0.8"/>
            </svg>
            <h2 className={styles.imageTitle}>정원의 정원</h2>
            <p className={styles.imageSubtitle}>아이의 모든 순간이 꽃피는 곳</p>
          </div>
          <svg className={styles.heartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>

        {/* Right Side: Form */}
        <div className={styles.formSection}>
          <h1 className={styles.title}>반가워요!</h1>
          <p className={styles.subtitle}>소중한 추억의 정원으로 들어오세요.</p>

          <form onSubmit={handleLogin}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <label className={styles.label}>이메일주소</label>
              </div>
              <input
                type="email"
                className={styles.input}
                placeholder="example@garden.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <label className={styles.label}>비밀번호</label>
              </div>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.checkboxWrapper}>
              <input type="checkbox" id="keepLoggedIn" className={styles.checkbox} />
              <label htmlFor="keepLoggedIn" className={styles.checkboxLabel}>로그인 상태 유지</label>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <div className={styles.signupPrompt}>
              아직 계정이 없으신가요?
              <Link href="/auth/register" className={styles.signupLink}>
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>
      <div className={styles.footer}>
        © 2024 정원의 정원. All moments cherished.
      </div>
    </div>
  );
}
