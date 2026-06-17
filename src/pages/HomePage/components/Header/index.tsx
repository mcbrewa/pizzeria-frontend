import Logo from './components/Logo'
import HeaderList from './components/HeaderList'
import Hamburger from './components/Hamburger'
import style from './styles.module.scss'

const Header = () => {
  return (
    <header className={style.header}>
      <Logo />
      <HeaderList />
      <Hamburger />
    </header>
  )
}

export default Header
