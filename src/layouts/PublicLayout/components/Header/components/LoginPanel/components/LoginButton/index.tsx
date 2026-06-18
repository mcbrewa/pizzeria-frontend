import { User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import style from './style.module.scss'

const LoginButton = () => {
  const { t } = useTranslation('common')
  return (
    <button type="button" className={style.btn} onClick={() => {}}>
      <span className={style.label}>{t('login')} →</span>
      <User size={20} strokeWidth={1.75} />
    </button>
  )
}

export default LoginButton
