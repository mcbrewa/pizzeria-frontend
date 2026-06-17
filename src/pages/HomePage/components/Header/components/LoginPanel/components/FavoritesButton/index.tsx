import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import style from './style.module.scss'

const FavoritesButton = () => {
  const { t } = useTranslation('common')
  return (
    <a href="#" className={style.btn} aria-label={t('actions.favorites')}>
      <Heart size={22} strokeWidth={1.75} />
    </a>
  )
}

export default FavoritesButton
