import { ShoppingBasket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import style from './style.module.scss'

const CartButton = () => {
  const { t } = useTranslation('common')
  return (
    <a href="#" className={style.btn} aria-label={t('actions.cart')}>
      <ShoppingBasket size={22} strokeWidth={1.75} />
    </a>
  )
}

export default CartButton
