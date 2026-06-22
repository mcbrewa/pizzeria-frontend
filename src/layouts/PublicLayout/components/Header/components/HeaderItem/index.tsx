import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import style from './style.module.scss'
import type { HeaderItemProps } from './types'

const HeaderItem = ({ translationKey, to, disabled, onClick, variant = 'nav' }: HeaderItemProps) => {
  const { t } = useTranslation('common')
  const isDrawerVariant = variant === 'drawer'

  if (disabled) {
    return (
      <li>
        <span className={isDrawerVariant ? style.drawerLinkDisabled : style.linkDisabled}>
          {t(translationKey)}
        </span>
      </li>
    )
  }

  return (
    <li>
      <Link
        to={to}
        className={isDrawerVariant ? style.drawerLink : style.link}
        activeProps={{ className: style.linkActive }}
        onClick={onClick}
      >
        {t(translationKey)}
      </Link>
    </li>
  )
}

export default HeaderItem
