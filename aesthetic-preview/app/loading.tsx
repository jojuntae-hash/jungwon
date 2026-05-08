import Skeleton from './components/Skeleton';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.container}>
      {/* Banner Skeleton */}
      <section className={styles.heroBanner}>
        <Skeleton width="100%" height="100%" borderRadius="40px" />
      </section>

      {/* Card Grid Skeleton */}
      <section className={styles.cardListSection}>
        <div className={styles.grid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.imageContainer}>
                <Skeleton width="100%" height="100%" borderRadius="24px" />
              </div>
              <div className={styles.cardInfo}>
                <Skeleton width="60%" height="24px" borderRadius="4px" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
