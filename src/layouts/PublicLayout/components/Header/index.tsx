import Logo from './components/Logo'
import HeaderList from './components/HeaderList'
import Hamburger from './components/Hamburger'
import LoginPanel from './components/LoginPanel'
import FavoritesButton from './components/LoginPanel/components/FavoritesButton'
import CartButton from './components/LoginPanel/components/CartButton'
import style from './styles.module.scss'

const Header = () => {
  return (
    <header className={style.header}>
      <div className={style.inner}>
        <Hamburger />
        <Logo />
        <HeaderList />
        <LoginPanel />
        <div className={style.mobileActions}>
          <FavoritesButton />
          <CartButton />
        </div>
      </div>
    </header>
  )
}

export default Header
