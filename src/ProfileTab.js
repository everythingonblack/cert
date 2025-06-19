import React, { useState, useRef, useEffect } from 'react';
import { FaPen } from 'react-icons/fa';
import styles from './ProfileTab.module.css';
import { useNavigate } from 'react-router-dom';

const ProfileTab = () => {
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('https://bot.kediritechnopark.com/webhook/dashboard?profileOnly=true', {
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

        setProfile(data.profile_data);
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      }
    };

    fetchData(); // Jalankan langsung saat komponen di-mount

  }, [navigate]);

    const [profile, setProfile] = useState({
        name: "Rikolo",
        company: "Dermalounge",
        address: "Jl. Pahlawan No.123, Kediri",
        email: "admin@dermalounge.com",
        phone: "08123456789",
        image: "/dermalounge.jpg"
    });

    const licenses = [
        { id: 1, type: "AI Bot License", number: "DL-2025-AI001", validUntil: "2026-12-31" },
        { id: 2, type: "Clinic Data Access", number: "DL-2025-CL002", validUntil: "2026-06-30" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('https://bot.kediritechnopark.com/webhook/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) throw new Error('Gagal menyimpan profil');

            const result = await response.json();
            console.log('Profil berhasil diperbarui:', result);

            setIsEditing(false);
            alert('Profil berhasil disimpan!');
        } catch (error) {
            console.error('Error saat menyimpan profil:', error);
            alert('Terjadi kesalahan saat menyimpan profil.');
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.profileHeader}>
                <h2>Profil Perusahaan</h2>
                <div className={styles.dropdownContainer} ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={styles.dropdownToggle}
                    >
                        ☰ Menu
                    </button>

                    {isMenuOpen && (
                        <div className={styles.dropdownMenu}>
                            <button onClick={() => navigate('/dashboard')} className={styles.dropdownItem}>
                                Dashboard
                            </button>

                            <button onClick={() => navigate('/reset-password')} className={styles.dropdownItem}>
                                Reset Password
                            </button>

                            <button onClick={() => { setIsEditing(!isEditing); setIsMenuOpen(false) }} className={styles.dropdownItem}>
                                {isEditing ? 'Batal Edit' : 'Edit'}
                            </button>

                            <button onClick={handleLogout} className={styles.dropdownItem}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.profileSection}>
                <img src={profile.image} alt="Company Logo" className={styles.companyImage} />
                <div className={styles.profileDetails}>
                    {["name", "company", "address", "email", "phone"].map((field) => (
                        <div key={field} className={styles.profileInputGroup}>
                            <label><strong>{field === "phone" ? "No. Telp" : field.charAt(0).toUpperCase() + field.slice(1)}:</strong></label>
                            <input
                                type="text"
                                name={field}
                                value={profile[field]}
                                onChange={handleChange}
                                className={`${styles.editableInput} ${!isEditing ? styles.readOnly : ''}`}
                                readOnly={!isEditing}
                            />

                        </div>
                    ))}
                    {isEditing &&
                        <div className={styles.licenseCard} style={{ marginTop: '20px', padding: '10px 16px' }} onClick={handleSave}
                        >
                            Simpan
                        </div>
                    }
                </div>
            </div>

            <div className={styles.licenseSection}>
                <h2>License</h2>
                <div className={styles.licenseCards}>
                    {licenses.map((item) => (
                        <div className={styles.licenseCard} key={item.id}>
                            <p><strong>{item.type}</strong></p>
                            <p>No: {item.number}</p>
                            <p>Berlaku sampai: {item.validUntil}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
