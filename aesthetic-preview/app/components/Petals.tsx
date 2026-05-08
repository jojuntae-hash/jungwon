"use client";

import { useEffect, useState } from 'react';
import styles from './Petals.module.css';

const PETAL_COUNT = 15;

export default function Petals() {
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: PETAL_COUNT }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      delay: Math.random() * 10 + 's',
      duration: Math.random() * 10 + 10 + 's',
      size: Math.random() * 15 + 10 + 'px',
      rotation: Math.random() * 360 + 'deg',
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className={styles.container}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className={styles.petal}
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            width: petal.size,
            height: petal.size,
            '--rotation': petal.rotation,
          } as any}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.5C12 21.5 17 17.5 19 14.5C21 11.5 21 7.5 18 5.5C15 3.5 12 6.5 12 6.5C12 6.5 9 3.5 6 5.5C3 7.5 3 11.5 5 14.5C7 17.5 12 21.5 12 21.5Z" fill="#FFD1DC" fillOpacity="0.6"/>
          </svg>
        </div>
      ))}
    </div>
  );
}
