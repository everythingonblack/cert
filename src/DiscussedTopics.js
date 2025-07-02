// DiscussedTopics.js
import React from 'react';
import styles from './DiscussedTopics.module.css';

const DiscussedTopics = ({ topics }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Top Topic</h2>
        <div className={styles.resultCount}>
          {topics.length} topik
        </div>
      </div>

      <div className={styles.grid}>
        {topics.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p>Discussed Topic Is Empty</p>
          </div>
        ) : (
          topics.map((topic, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.topicName}>{topic.topic}</h3>
                <div className={styles.countBadge}>
                  <span className={styles.countValue}>{topic.count}</span>
                  <span className={styles.countLabel}>times</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussedTopics;