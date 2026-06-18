import { Outlet } from '@tanstack/react-router'
import styles from './style.module.scss'

const AuthLayout = () => {
  return (
    <div className={styles.layout}>
      <Outlet />
    </div>
  )
}

export default AuthLayout
