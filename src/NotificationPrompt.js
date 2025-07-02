import React from 'react';
import styles from './NotificationPrompt.module.css';

export default function NotificationPrompt({ onAllow, onDismiss }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.iconWrapper}>
          <div className={styles.notificationIcon}>🔔</div>
        </div>
        
        <div className={styles.content}>
          <h2 className={styles.title}>Aktifkan Notifikasi</h2>
          <p className={styles.description}>
            Tetap terhubung dengan update penting dan peringatan terbaru. 
            Aktifkan notifikasi push agar tidak ketinggalan informasi penting.
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={onAllow} className={styles.primaryButton}>
            <span className={styles.buttonIcon}>✓</span>
            Aktifkan Notifikasi
          </button>
          <button onClick={onDismiss} className={styles.secondaryButton}>
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}