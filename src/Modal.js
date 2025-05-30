// Modal.js
import React, {useEffect} from 'react';
import styles from './Modal.module.css';

const Modal = ({ onClose, children }) => {
  const stopPropagation = (e) => e.stopPropagation();
useEffect(() =>{
        document.body.style.overflow = 'hidden';

}, [])
const handleClose = () => {
        document.body.style.overflow = 'auto';
        onClose();
}
  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={stopPropagation}>
        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
