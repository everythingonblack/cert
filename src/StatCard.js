import React, { useEffect, useState } from 'react';
import styles from './StatCard.module.css';
import FollowUps from './FollowUps';

const StatCard = ({ followUps, setModalContent }) => {
  const [activeIndex, setActiveIndex] = useState(0); // 0 = booking request, 1 = sukses
  const [direction, setDirection] = useState('right'); // for animation direction

  const views = [
    {
      label: 'BOOKING REQUEST',
      data: followUps.filter(u => !u.isfollowup && !u.issuccess),
    },
    {
      label: 'FOLLOWED UP',
      data: followUps.filter(u => u.issuccess),
    }
  ];

  // Swipe timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(prev => (prev === 'right' ? 'left' : 'right'));
      setActiveIndex(prev => 1 - prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setModalContent(<FollowUps data={followUps} />);
  };

  return (
    <div className={styles.statCard} onClick={handleClick}>
      <div
        key={activeIndex} // re-render to trigger animation
        className={`${styles.cardContent} ${
          direction === 'right' ? styles.slideInRight : styles.slideInLeft
        }`}
      >
        <h2>{views[activeIndex].data.length}</h2>
        <p>{views[activeIndex].label}</p>
      </div>
    </div>
  );
};

export default StatCard;
