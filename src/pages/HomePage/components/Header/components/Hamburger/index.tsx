import { Menu } from 'lucide-react'
import style from './style.module.scss'

const Hamburger = () => {
  return (
    <button className={style.btn} aria-label="Open menu">
      <Menu size={28} strokeWidth={1.75} />
    </button>
  )
}

export default Hamburger
