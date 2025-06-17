import React from 'react';
import styles from './NotificationPrompt.module.css';

export default function NotificationPrompt({ onAllow, onDismiss }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Enable Notifications</h2>
        <p className={styles.description}>
          Stay up to date with important updates and alerts. Enable push notifications to never miss a thing.
        </p>
        <div className={styles.actions}>
          <button onClick={onAllow} className={styles.primaryButton}>
            Enable Notifications
          </button>
          <button onClick={onDismiss} className={styles.secondaryButton}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
