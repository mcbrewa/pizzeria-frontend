import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '#/hooks/useAuth'
import styles from './style.module.scss'

const WelcomePage = () => {
  const { user, logout, isInitialized } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isInitialized && !user) {
      navigate({ to: '/' })
    }
  }, [isInitialized, user, navigate])

  if (!isInitialized || !user) return null

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.heading}>
          Witaj, <span className={styles.name}>{user.firstName}</span>!
        </h1>
        <p className={styles.sub}>
          Zalogowano jako <strong>{user.email}</strong>
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>
            Przejdź do strony głównej
          </Link>
          <button
            className={styles.logoutBtn}
            onClick={async () => { await logout() }}
          >
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
