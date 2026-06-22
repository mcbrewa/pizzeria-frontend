import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import LoginForm from './components/LoginForm'
import styles from './style.module.scss'

type Tab = 'login' | 'register'

interface AuthModalProps {
  onClose: () => void
}

const AuthModal = ({ onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button className={styles.close} onClick={onClose} aria-label="Zamknij">
          <X size={20} />
        </button>

        <h2 className={styles.title} id="auth-modal-title">
          LOGOWANIE
        </h2>

        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`${styles.tab} ${activeTab === 'register' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Załóż konto
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Zaloguj się
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'login' ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <p className={styles.empty}>Rejestracja — wkrótce</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
