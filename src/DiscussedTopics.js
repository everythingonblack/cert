// DiscussedTopics.js
import React, { useState } from 'react';
import styles from './DiscussedTopics.module.css';

const DiscussedTopics = ({ topics, faceAnalystList }) => {
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' or 'face'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabButton} ${activeTab === 'topics' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            Top Topic
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'face' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('face')}
          >
            Face Analyst Report
          </button>
        </div>
        <div className={styles.resultCount}>
          {activeTab === 'topics'
            ? `${topics.length} topik`
            : `${faceAnalystList.length} report`}
        </div>
      </div>

      <div className={styles.grid}>
        {activeTab === 'topics' ? (
          topics.length === 0 ? (
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
          )
        ) : faceAnalystList.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🧑‍⚕️</div>
            <p>No Face Analyst Report</p>
          </div>
        ) : (
          faceAnalystList.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.topicName}>{item.name}</h3>
                <p className={styles.description}>{item.description}</p>
                <p className={styles.phone}>📞 {item.phone_number}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussedTopics;
