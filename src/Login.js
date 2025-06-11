import React, { useState } from 'react';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.username === 'dermalounge' && formData.password === '1234') {
      window.location.href = '/dashboard'; // redirect after successful login
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <img src="/dermalounge.jpg" alt="Logo" className={styles.logo} />
        <h1 className={styles.h1}>Dermalounge AI Admin Login</h1>
        <p className={styles.subtitle}>Silakan masuk untuk melanjutkan ke dashboard</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
        <div className={styles.footer}>
          &copy; 2025 Kloowear AI - Admin Panel
        </div>
      </div>
    </div>
  );
};

export default Login;
