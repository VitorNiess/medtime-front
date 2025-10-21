import styles from "./modal.module.css";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.modal}>
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <button className={styles.close} onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}