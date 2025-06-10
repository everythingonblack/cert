import React, { useEffect, useRef, useState } from 'react';
import styles from './Dashboard.module.css';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

import Modal from './Modal';
import Conversations from './Conversations';
import DiscussedTopics from './DiscussedTopics';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Dashboard = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [stats, setStats] = useState({
    totalChats: 0,
    userMessages: 0,
    botMessages: 0,
    activeNow: 0,
    mostDiscussedTopics: '',
  });

  const [conversations, setConversations] = useState([]);
  const [discussedTopics, setDiscussedTopics] = useState([]);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('https://n8n.kediritechnopark.my.id/webhook/master-agent/dashboard');
        const data = await response.json();

        if (data.length === 0) return;

        const parsedResult = JSON.parse(data[0].result);
        const conversationsData = parsedResult.conversations || [];
        const discussedTopicsData = parsedResult.discussed_topics || [];

        setConversations(conversationsData);
        setDiscussedTopics(discussedTopicsData);

        const totalChats = conversationsData.length;
        let userMessages = 0;
        let botMessages = 0;

        conversationsData.forEach(conv => {
          conv.messages.forEach(msg => {
            if (msg.sender === 'user') userMessages++;
            if (msg.sender === 'bot') botMessages++;
          });
        });

        const activeNow = 5; // Contoh dummy
        discussedTopicsData.sort((a, b) => b.question_count - a.question_count);
        const mostDiscussedTopics = discussedTopicsData[0]?.topic || '-';

        setStats({ totalChats, userMessages, botMessages, activeNow, mostDiscussedTopics });

        const labels = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00", "02:00", "04:00", "06:00"];
        const hourMap = { 8: 0, 10: 1, 12: 2, 14: 3, 16: 4, 18: 5, 20: 6, 22: 7, 0: 8, 2: 9, 4: 10, 6: 11 };
        const dataChart = new Array(labels.length).fill(0);

        // Hitung berdasarkan jam dari conversation.createdAt
          console.log(conversationsData)
        conversationsData.forEach(conv => {
          console.log(conv)
          if (conv.createdAt) {
            const date = new Date(conv.createdAt.replace(' ', 'T'));
            const hour = date.getHours();
            if (hourMap.hasOwnProperty(hour)) {
              const idx = hourMap[hour];
              dataChart[idx]++;
            }
          }
        });


        const ctx = chartRef.current.getContext("2d");
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: "Pesan Masuk per Jam",
              data: dataChart,
              borderColor: "#075e54",
              backgroundColor: "rgba(7, 94, 84, 0.2)",
              fill: true,
              tension: 0.3,
            }]
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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <img src="/dermalounge.jpg" alt="Bot Avatar" />
        <div>
          <h1>Dermalounge AI Admin Dashboard</h1>
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
        <h2 className={styles.chartTitle}>Grafik Interaksi (Simulasi)</h2>
        <canvas ref={chartRef}></canvas>
      </div>

      <div className={styles.footer}>
        UNTUK MENAMBAHKAN LAYANAN, KUNJUNGI <a href="https://drive.kediritechnopark.com">LINK INI</a>
 dengan username: dermalounge, password: 1234
      </div>
      <div className={styles.footer}>
        &copy; 2025 Kloowear AI - Admin Panel
      </div>

      {modalContent && <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>}
    </div>
  );
};

export default Dashboard;
