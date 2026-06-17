import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from '../Logo'
import LoginButton from '../LoginPanel/components/LoginButton'
import LanguageSelector from '../LoginPanel/components/LanguageSelector'
import HeaderItem from '../HeaderItem'
import { NAV_ITEMS } from '../../data'
import style from './style.module.scss'

const Hamburger = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const close = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        className={style.btn}
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu size={28} strokeWidth={1.75} />
      </button>

      {isOpen && <div className={style.overlay} onClick={close} aria-hidden="true" />}

      <div className={`${style.drawer}${isOpen ? ` ${style.drawerOpen}` : ''}`} aria-hidden={!isOpen}>
        <div className={style.drawerHeader}>
          <button type="button" className={style.closeBtn} onClick={close} aria-label="Close menu">
            <X size={24} strokeWidth={1.75} />
          </button>
          <div className={style.drawerLogoWrapper}>
            <Logo />
          </div>
        </div>

        <div className={style.drawerLogin}>
          <LoginButton />
        </div>

        <nav>
          <ul className={style.drawerNav}>
            {NAV_ITEMS.map((item) => (
              <HeaderItem
                key={item.key}
                translationKey={item.key}
                to={item.to}
                variant="drawer"
                onClick={close}
              />
            ))}
          </ul>
        </nav>

        <div className={style.drawerLang}>
          <LanguageSelector variant="flags" />
        </div>
      </div>
    </>
  )
}

export default Hamburger
