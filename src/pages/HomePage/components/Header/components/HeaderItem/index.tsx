import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import style from './style.module.scss'
import type { HeaderItemProps } from './types'

const HeaderItem = ({ translationKey, to }: HeaderItemProps) => {
  const { t } = useTranslation('common')
  return (
    <li>
      <Link to={to} className={style.link} activeProps={{ className: style.linkActive }}>
        {t(translationKey)}
      </Link>
    </li>
  )
}

export default HeaderItem
