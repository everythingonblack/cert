import React, { useRef, useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

import Modal from './Modal';
import Conversations from './Conversations';
import DiscussedTopics from './DiscussedTopics';

import Chart from 'chart.js/auto';

const Dashboard = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [discussedTopics, setDiscussedTopics] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [rawData, setRawData] = useState([]);

  const stats = {
    totalChats: 0,
    userMessages: 0,
    botMessages: 0,
    activeNow: 0,
    mostDiscussedTopics: '-',
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('https://botdev.kediritechnopark.com/webhook/master-agent/dashboard');
        const data = await response.json();
        setRawData(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    }

    fetchStats();
  }, []);

  const openConversationsModal = () => {
    setModalContent(<Conversations conversations={conversations} />);
  };

  const openTopicsModal = () => {
    setModalContent(<DiscussedTopics topics={discussedTopics} />);
  };


  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    // Cleanup old chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const prefixes = ['WEB', 'WAP', 'DME'];
    const prefixLabelMap = {
      WEB: 'Web App',
      WAP: 'WhatsApp',
      DME: 'Direct Message',
    };
    const prefixColors = {
      WEB: { border: '#4285F4', background: 'rgba(66, 133, 244, 0.2)' },
      WAP: { border: '#25D366', background: 'rgba(37, 211, 102, 0.2)' },
      DME: { border: '#AA00FF', background: 'rgba(170, 0, 255, 0.2)' },
    };

    const hours = [...new Set(rawData.map(d => d.hour_group))].sort();

    // Initialize zero-filled data structure
    const counts = {
      WEB: hours.map(() => 0),
      WAP: hours.map(() => 0),
      DME: hours.map(() => 0)
    };

    rawData.forEach(({ hour_group, session_prefix, session_ids }) => {
      const hourIndex = hours.indexOf(hour_group);
      if (counts[session_prefix] && hourIndex !== -1) {
        counts[session_prefix][hourIndex] += session_ids.length;
      }
    });

    const datasets = prefixes.map(prefix => ({
      label: prefixLabelMap[prefix],
      data: counts[prefix],
      borderColor: prefixColors[prefix].border,
      backgroundColor: prefixColors[prefix].background,
      fill: true,
      tension: 0.3
    }));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  }, [rawData]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <img src="/dermalounge.jpg" alt="Bot Avatar" />
        <div>
          <h1 className={styles.h1}>Dermalounge AI Admin Dashboard</h1>
          <p>Statistik penggunaan chatbot secara real-time</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard} onClick={openConversationsModal}>
          <h2>{stats.totalChats}</h2>
          <p>Total Percakapan Hari Ini</p>
        </div>
        <div className={styles.statCard}>
          <h2>{stats.userMessages}</h2>
          <p>Pesan dari Pengguna</p>
        </div>
        <div className={styles.statCard}>
          <h2>{stats.botMessages}</h2>
          <p>Respons Bot</p>
        </div>
        <div className={styles.statCard} onClick={openTopicsModal}>
          <h2 style={{ fontSize: '17px' }}>{stats.mostDiscussedTopics}</h2>
          <p>Paling sering ditanyakan</p>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Grafik Interaksi</h2>
        <canvas ref={chartRef}></canvas>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Grafik request booking</h2>
        <canvas></canvas>
      </div>

      <div className={styles.footer}>
        &copy; 2025 Kloowear AI - Admin Panel
      </div>

      {modalContent && <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>}
    </div>
  );
};

export default Dashboard;
