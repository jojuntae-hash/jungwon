import Skeleton from '@/app/components/Skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <main className={styles.container}>
      {/* Filter Bar Skeleton */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
          <Skeleton width="220px" height="40px" borderRadius="20px" />
          <Skeleton width="100px" height="40px" borderRadius="20px" />
        </div>
      </div>

      <div className={styles.countBar}>
        <Skeleton width="120px" height="20px" borderRadius="4px" />
      </div>

      <section className={styles.cardSection}>
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <Skeleton width="100%" height="100%" borderRadius="20px" />
              </div>
              <div className={styles.cardContent}>
                <Skeleton width="70%" height="24px" borderRadius="4px" />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Skeleton width="40px" height="20px" borderRadius="10px" />
                  <Skeleton width="40px" height="20px" borderRadius="10px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
