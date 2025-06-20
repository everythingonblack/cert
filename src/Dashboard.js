import React, { useRef, useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

import Modal from './Modal';
import Conversations from './Conversations';
import DiscussedTopics from './DiscussedTopics';

import FollowUps from './FollowUps';

import Chart from 'chart.js/auto';
import NotificationPrompt from './NotificationPrompt';

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [discussedTopics, setDiscussedTopics] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true); // ⬅️ Tambahkan state loading
  const [checkOnce, setCheckOnce] = useState(false); // ⬅️ Tambahkan state loading

  const [stats, setStats] = useState({
    totalChats: 0,
    botMessages: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigator.serviceWorker.ready.then(function (registration) {
      registration.pushManager.getSubscription().then(function (subscription) {
        if (subscription) {
          subscription.unsubscribe().then(function (successful) {
            console.log('Push subscription unsubscribed on logout:', successful);
            // Optional: also notify backend to clear the token
            fetch('/api/clear-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ endpoint: subscription.endpoint }),
            });
          });
        }
      });
    });

    window.location.reload();
  };

  const menuRef = useRef(null);

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('https://bot.kediritechnopark.com/webhook/dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error('Fetch gagal dengan status: ' + response.status);
        }

        const data = await response.json();
        console.log(data);
        setDiscussedTopics(data?.result?.topics)
        setFollowUps(data?.result?.interested_users)

        const graphObj = data.result.graph;
        const rawDataArray = Object.entries(graphObj).map(([hour, sesi]) => ({
          hour,
          sesi,
        }));
        setRawData(rawDataArray);
        let totalSessions = new Set();
        let botMessages = 0;

        rawDataArray.forEach(({ sesi }) => {
          Object.values(sesi).forEach(messages => {
            messages.forEach(msg => {
              totalSessions.add(msg.session_id);
              if (msg.message.type === 'ai') botMessages++;
            });
          });
        });

        setStats({
          totalChats: totalSessions.size,
          botMessages,
        });

        setLoading(false); // ⬅️ Setelah berhasil, hilangkan loading
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      }
    };

    if (!checkOnce && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function (registration) {
        registration.pushManager.getSubscription().then(function (subscription) {
          setCheckOnce(true);
          if (subscription === null) {
            // Not subscribed yet — show modal asking user to subscribe
            setModalContent(<NotificationPrompt onAllow={subscribeUser} onDismiss={() => setModalContent('')} />);
          } else {
            // Already subscribed
            setModalContent('')
            console.log('User is already subscribed.');
            subscribeUser();
          }
        });
      });
    }

    fetchData(); // Jalankan langsung saat komponen di-mount
    const interval = setInterval(fetchData, 60000); // Jalankan setiap 30 detik
    return () => clearInterval(interval); // Bersihkan interval saat komponen unmount

  }, [navigate]);

  const subscribeUser = async () => {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('BPT-ypQB0Z7HndmeFhRR7AMjDujCLSbOQ21VoVHLQg9MOfWhEZ7SKH5cMjLqkXHl2sTuxdY2rjHDOAxhRK2G2K4'),
    });

    const token = localStorage.getItem('token');

    await fetch('https://bot.kediritechnopark.com/webhook/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        subscription, // ← push subscription object
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    setModalContent('')
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

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
      TGG: 'Telegram',
      WGG: 'Whatsapp',
      IGG: 'Instagram',
    };

    const prefixColors = {
      WEB: { border: '#e2b834', background: 'rgba(226,184,52,0.6)' },
      TGG: { border: '#24A1DE', background: 'rgba(36,161,222,0.6)' },
      WGG: { border: '#25d366', background: 'rgba(37,211,102,0.6)' },
      IGG: { border: '#d62976', background: 'rgba(214,41,118,0.6)' },
    };

    const prefixes = Object.keys(prefixLabelMap);
    const parsedHours = rawData.map(d => new Date(d.hour));
    parsedHours.sort((a, b) => a - b);

    // Extract only the date (no timezone shifting)
    const getDateStr = date => date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');


    const hours = parsedHours.map((date, index) => {
      const timeStr = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
      return index === parsedHours.length - 1 ? 'Now' : timeStr;
    });

    const counts = {};
    prefixes.forEach(prefix => {
      counts[prefix] = hours.map(() => 0);
    });

    rawData.forEach(({ sesi }, index) => {
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
            labels: {
              boxWidth: 15
            }
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            ticks: {
              font: {
                size: 10, // 👈 set your desired font size here
              },
            },
          },
        },
      },
    });
  }, [rawData]);

  // ⬇️ Jika masih loading, tampilkan full white screen
  if (loading) {
    return <div style={{ backgroundColor: 'white', width: '100vw', height: '100vh' }} />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.dropdownContainer} ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={styles.dropdownToggle}
          >
            ☰ Menu
          </button>

          {isMenuOpen && (
            <div className={styles.dropdownMenu}>
              <button onClick={() => navigate('/profile')} className={styles.dropdownItem}>
                Profile
              </button>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                Logout
              </button>
            </div>
          )}
        </div>
        <img src="/dermalounge.jpg" alt="Bot Avatar" />
        <div>
          <h1 className={styles.h1}>Dermalounge AI Admin Dashboard</h1>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h2>{stats.totalChats}</h2>
          <p>TOTAL USER PER DAY</p>
        </div>
        <div className={styles.statCard}>
          <h2>{stats.botMessages}</h2>
          <p>AI RESPONSE</p>
        </div>
        <div className={styles.statCard} onClick={() => setModalContent(<FollowUps data={followUps} />)}>
          <h2>{followUps.length}</h2>
          <p>BOOKING REQUEST</p>
        </div>
        <div className={styles.statCard} onClick={openTopicsModal}>
          <h2 style={{ fontSize: '17px' }}>{discussedTopics[0]?.topic}</h2>
          <p>Top topic</p>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Interactions</h2>
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
            Drop file here, or <span className={styles.uploadLink}>Click to upload</span>
          </p>
          <p className={styles.mobileText}>Click to upload</p>

          {selectedFile && (
            <>
              <div className={styles.fileInfo}>
                <strong>{selectedFile.name}</strong>
              </div>
              <div className={styles.fileInfoClose} onClick={() => setSelectedFile(null)}>
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
