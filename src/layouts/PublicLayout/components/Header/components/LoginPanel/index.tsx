import LoginButton from './components/LoginButton'
import LanguageSelector from './components/LanguageSelector'
import FavoritesButton from './components/FavoritesButton'
import CartButton from './components/CartButton'
import style from './style.module.scss'

const LoginPanel = () => {
  return (
    <div className={style.panel}>
      <div className={style.topRow}>
        <LoginButton />
        <LanguageSelector />
      </div>
      <div className={style.bottomRow}>
        <FavoritesButton />
        <CartButton />
      </div>
    </div>
  )
}

export default LoginPanel
