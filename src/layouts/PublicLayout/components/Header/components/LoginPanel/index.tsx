import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '#/hooks/useAuth'
import LoginButton from './components/LoginButton'
import LanguageSelector from './components/LanguageSelector'
import FavoritesButton from './components/FavoritesButton'
import CartButton from './components/CartButton'
import AuthModal from '#/components/ui/AuthModal'
import style from './style.module.scss'

const LoginPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, logout, isLoading } = useAuth()
  const { t } = useTranslation('common')

  return (
    <div className={style.panel}>
      <div className={style.topRow}>
        {user ? (
          <LoginButton label={t('logout')} onClick={logout} disabled={isLoading} />
        ) : (
          <LoginButton label={t('login')} onClick={() => setIsModalOpen(true)} />
        )}
        <LanguageSelector />
      </div>
      <div className={style.bottomRow}>
        <FavoritesButton />
        <CartButton />
      </div>
      {!user && isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}

export default LoginPanel
