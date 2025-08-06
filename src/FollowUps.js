import React, { useState } from 'react';
import styles from './FollowUps.module.css';

const FollowUps = ({ data: initialData }) => {
  const [data, setData] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  const handleFollowUp = async (e, user) => {
    e.preventDefault();

    try {
      await fetch('https://bot.kediritechnopark.com/webhook/set-follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user.id,
          isfollowup: user.isfollowup ? 'success' : 'followup'
        })
      });

      if (user.isfollowup) {
        setData(prev =>
          prev.map(u =>
            u.id === user.id ? { ...u, isfollowup: false, issuccess: true } : u
          )
        );
      } else {
        setData(prev =>
          prev.map(u =>
            u.id === user.id ? { ...u, isfollowup: true } : u
          )
        );
      }

      if (!user.isfollowup) {
        window.open(`https://api.whatsapp.com/send?phone=${user.contact_info}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to set follow-up:', error);
      alert('Failed to send follow-up status.');
    }
  };

  // Gabungkan data berdasarkan contact_info
  const mergedDataMap = new Map();

  data.forEach(user => {
    const key = user.contact_info;

    if (!mergedDataMap.has(key)) {
      mergedDataMap.set(key, {
        ...user,
        notesList: [{
          note: user.notes,
          created_at: user.created_at
        }]
      });
    } else {
      const existing = mergedDataMap.get(key);
      existing.notesList.push({
        note: user.notes,
        created_at: user.created_at
      });

      // Prioritaskan status tertinggi
      existing.issuccess = existing.issuccess || user.issuccess;
      existing.isfollowup = existing.issuccess ? false : (existing.isfollowup || user.isfollowup);
    }
  });

  const mergedData = Array.from(mergedDataMap.values());

  // Filter & Sort
  const now = new Date();
  const filteredData = mergedData
    .filter(user => {
      switch (statusFilter) {
        case 'pending':
          return !user.isfollowup && !user.issuccess;
        case 'inProgress':
          return user.isfollowup && !user.issuccess;
        case 'success':
          return user.issuccess;
        default:
          return true;
      }
    })
    .filter(user => {
      const latestNote = user.notesList[user.notesList.length - 1];
      const created = new Date(latestNote.created_at);
      switch (dateFilter) {
        case 'today':
          return created.toDateString() === now.toDateString();
        case 'week':
          const aWeekAgo = new Date();
          aWeekAgo.setDate(now.getDate() - 7);
          return created >= aWeekAgo;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const aDate = new Date(a.notesList[a.notesList.length - 1].created_at);
      const bDate = new Date(b.notesList[b.notesList.length - 1].created_at);
      return sortOrder === 'latest' ? bDate - aDate : aDate - bDate;
    });

  return (
    <div className={styles.container}>
      {/* Filter Controls */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Status</label>
            <select 
              className={styles.filterSelect}
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="inProgress">In Progress</option>
              <option value="success">Followed Up</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Period</label>
            <select 
              className={styles.filterSelect}
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Sort By</label>
            <select 
              className={styles.filterSelect}
              value={sortOrder} 
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className={styles.resultCount}>
          {filteredData.length} of {data.length} records
        </div>
      </div>

      {/* Cards Grid */}
      <div className={styles.grid}>
        {filteredData.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p>No data matches the filters</p>
          </div>
        ) : (
          filteredData.map(user => (
            <div key={user.contact_info} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.userName}>{user.name}</h3>
                <span className={styles.statusBadge}>
                  {user.issuccess ? (
                    <span className={styles.badgeSuccess}>✓ Followed Up</span>
                  ) : user.isfollowup ? (
                    <span className={styles.badgeProgress}>⏳ In Progress</span>
                  ) : (
                    <span className={styles.badgePending}>• Pending</span>
                  )}
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <ul className={styles.notesList}>
                  {user.notesList.map((entry, index) => (
                    <li key={index}>
                      <strong>{new Date(entry.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Asia/Jakarta'
                      })}:</strong> {entry.note}
                    </li>
                  ))}
                </ul>
                <div className={styles.contactInfo}>
                  <span className={styles.contactLabel}>Contact:</span>
                  <span className={styles.contactValue}>{user.contact_info}</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={`${styles.actionBtn} ${
                    user.issuccess 
                      ? styles.btnSuccess 
                      : user.isfollowup 
                      ? styles.btnComplete 
                      : styles.btnPrimary
                  }`}
                  onClick={(e) => handleFollowUp(e, user)}
                >
                  {user.issuccess
                    ? '✓ Follow-up Success'
                    : user.isfollowup
                    ? '✓ Mark as Complete'
                    : '💬 Chat on WhatsApp'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowUps;
