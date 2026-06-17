import logo from '#/images/logo_sracz.svg'
import style from './style.module.scss'

const Logo = () => {
  return (
    <a href="/" className={style.link}>
      <img src={logo} alt="Domino's Pizza" className={style.img} />
    </a>
  )
}

export default Logo
