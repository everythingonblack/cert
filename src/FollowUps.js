import React from 'react';
import styles from './FollowUps.module.css';

const FollowUps = ({ data }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User yang tertarik</h2>
      <div className={styles.grid}>
        {data.map(user => (
          <div key={user.id} className={styles.card}>
            <div className={styles.header}>
              <h3>{user.name}</h3>
              <span className={styles.date}>
                {new Date(user.created_at).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'Asia/Jakarta'
                })}
              </span>
            </div>
            <p className={styles.notes}>{user.notes}</p>
            <div className={styles.footer}>
              <span className={styles.contact}>{user.contact_info}</span>
              <a
                className={styles.chatBtn}
                href={`https://api.whatsapp.com/send?phone=${user.contact_info}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUps;
