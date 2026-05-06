"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, name);
      
      if (error) {
        setError(error.message);
      } else {
        router.push('/auth/login?registered=true');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
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
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>정원의 정원에 오신 것을 환영합니다.</p>

          <form onSubmit={handleRegister}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <div className={styles.labelWrapper} style={{ marginBottom: '6px' }}>
                <label className={styles.label}>이름</label>
              </div>
              <input
                type="text"
                className={styles.input}
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ padding: '12px 20px', marginBottom: '0' }}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <div className={styles.labelWrapper} style={{ marginBottom: '6px' }}>
                <label className={styles.label}>이메일주소</label>
              </div>
              <input
                type="email"
                className={styles.input}
                placeholder="example@garden.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '12px 20px', marginBottom: '0' }}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <div className={styles.labelWrapper} style={{ marginBottom: '6px' }}>
                <label className={styles.label}>비밀번호</label>
              </div>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '12px 20px', marginBottom: '0' }}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
              <div className={styles.labelWrapper} style={{ marginBottom: '6px' }}>
                <label className={styles.label}>비밀번호 확인</label>
              </div>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                style={{ padding: '12px 20px', marginBottom: '0' }}
              />
            </div>

            <button type="submit" className={styles.button} disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? '가입 중...' : '회원가입'}
            </button>

            <div className={styles.signupPrompt}>
              이미 계정이 있으신가요?
              <Link href="/auth/login" className={styles.signupLink}>
                로그인
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
