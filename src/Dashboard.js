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
  
  const [stats, setStats] = useState({
  totalChats: 0,
  userMessages: 0,
  botMessages: 0,
  mostDiscussedTopics: '-',
});


  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
    }
  };


  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('https://bot.kediritechnopark.com/webhook/master-agent/dashboard');
        const data = await response.json();
        setRawData(data)

        setRawData(data);

        // Hitung statistik
        let totalSessions = new Set(); // unik session_id
        let userMessages = 0;
        let botMessages = 0;

        data.forEach(({ sesi }) => {
          Object.entries(sesi).forEach(([channel, messages]) => {
            messages.forEach((msg) => {
              totalSessions.add(msg.session_id);
              if (msg.message.type === 'human') userMessages++;
              if (msg.message.type === 'ai') botMessages++;
            });
          });
        });

        setStats({
          totalChats: totalSessions.size,
          userMessages,
          botMessages,
          mostDiscussedTopics: '-', // placeholder, bisa ditambah nanti
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


useEffect(() => {
  if (!rawData.length) return;

  const ctx = chartRef.current?.getContext('2d');
  if (!ctx) return;

  if (chartInstanceRef.current) {
    chartInstanceRef.current.destroy();
  }

  const prefixLabelMap = {
    WEB: 'Web App',
    WAP: 'WhatsApp',
    DME: 'Instagram',
  };

  const prefixColors = {
    WEB: { border: '#4285F4', background: 'rgba(66, 133, 244, 0.2)' },
    WAP: { border: '#25D366', background: 'rgba(37, 211, 102, 0.2)' },
    DME: { border: '#AA00FF', background: 'rgba(170, 0, 255, 0.2)' },
  };

  const prefixes = Object.keys(prefixLabelMap);

  // Ambil semua grub (jam)
  const hours = rawData.map(d => d.grub).sort((a, b) => parseFloat(a) - parseFloat(b));

  // Inisialisasi data per platform
  const counts = {};
  prefixes.forEach(prefix => {
    counts[prefix] = hours.map(() => 0);
  });

  // Hitung jumlah pesan berdasarkan panjang array per grub & prefix
  rawData.forEach((entry, index) => {
    const sesi = entry.sesi || {};
    prefixes.forEach(prefix => {
      if (Array.isArray(sesi[prefix])) {
        counts[prefix][index] = sesi[prefix].length;
      }
    });
  });

  const datasets = prefixes.map(prefix => ({
    label: prefixLabelMap[prefix],
    data: counts[prefix],
    borderColor: prefixColors[prefix].border,
    backgroundColor: prefixColors[prefix].background,
    fill: true,
    tension: 0.3,
  }));

  chartInstanceRef.current = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Jumlah Pesan',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Jam',
          },
        },
      },
    },
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
      <h2 className={styles.chartTitle}>Update data</h2>

      <div
        className={`${styles.uploadContainer} ${isDragging ? styles.dragActive : ""}`}
        onClick={() => selectedFile ? null : document.getElementById("fileInput").click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
      >
        <p className={styles.desktopText}>
          Seret file ke sini, atau <span className={styles.uploadLink}>Klik untuk unggah</span>
        </p>
        <p className={styles.mobileText}>Klik untuk unggah</p>

        {selectedFile && (
          <>
          <div className={styles.fileInfo}>
            <strong>{selectedFile.name}</strong>
          </div>
          <div className={styles.fileInfoClose} onClick={()=>setSelectedFile(null)}>
            X
          </div>
          </>
        )}

        <input
          id="fileInput"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            handleFile(file);
          }}
        />
      </div>
    </div>


      <div className={styles.footer}>
        &copy; 2025 Kediri Technopark
      </div>

      {modalContent && <Modal onClose={() => setModalContent(null)}>{modalContent}</Modal>}
    </div>
  );
};

export default Dashboard;
