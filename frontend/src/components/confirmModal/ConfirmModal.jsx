import React from "react";
import styles from "./ConfirmModal.module.scss";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <div className={styles.buttons}>
          <button className={styles.confirm} onClick={onConfirm}>Bəli</button>
          <button className={styles.cancel} onClick={onCancel}>Ləğv et</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
