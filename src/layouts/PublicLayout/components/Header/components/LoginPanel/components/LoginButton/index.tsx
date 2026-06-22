import { User } from 'lucide-react'
import style from './style.module.scss'

interface LoginButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

const LoginButton = ({ label, onClick, disabled }: LoginButtonProps) => (
  <button type="button" className={style.btn} onClick={onClick} disabled={disabled}>
    <span className={style.label}>{label} →</span>
    <User size={20} strokeWidth={1.75} />
  </button>
)

export default LoginButton
