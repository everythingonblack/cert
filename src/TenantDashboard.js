import React, { useEffect, useRef } from 'react';
import styles from './Dashboard.module.css';
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Title, Tooltip, Legend);

const TenantDashboard = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const stats = {
      totalChats: 120,
      userMessages: 210,
      botMessages: 220,
      activeNow: 5,
    };

    // Inject stats manually
    document.getElementById("totalChats").textContent = stats.totalChats;
    document.getElementById("userMessages").textContent = stats.userMessages;
    document.getElementById("botMessages").textContent = stats.botMessages;
    document.getElementById("activeNow").textContent = stats.activeNow;

    // Get canvas from ref
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
        datasets: [{
          label: "Pesan Masuk",
          data: [10, 25, 45, 30, 50, 60],
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
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <img src="https://i.ibb.co/YXxXr72/bot-avatar.png" alt="Bot Avatar" />
        <div>
          <h1>Kloowear AI Admin Dashboard</h1>
          <p>Statistik penggunaan chatbot secara real-time</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h2 id="totalChats">0</h2><p>Total Percakapan Hari Ini</p></div>
        <div className={styles.statCard}><h2 id="userMessages">0</h2><p>Pesan dari Pengguna</p></div>
        <div className={styles.statCard}><h2 id="botMessages">0</h2><p>Respons Bot</p></div>
        <div className={styles.statCard}><h2 id="activeNow">0</h2><p>Pengguna Aktif Sekarang</p></div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.chartTitle}>Grafik Interaksi (Simulasi)</h2>
        <canvas ref={chartRef}></canvas>
      </div>

      <div className={styles.footer}>
        &copy; 2025 Kloowear AI - Admin Panel
      </div>
    </div>
  );
};

export default TenantDashboard;
