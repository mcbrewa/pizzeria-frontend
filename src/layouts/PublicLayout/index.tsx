import { Outlet } from '@tanstack/react-router'
import Header from './components/Header'
import styles from './style.module.scss'

const PublicLayout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
