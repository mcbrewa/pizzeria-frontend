import { useTranslation } from 'react-i18next'
import styles from './style.module.scss'

interface CtaButtonsProps {
  onOrderClick: () => void
}

const CtaButtons = ({ onOrderClick }: CtaButtonsProps) => {
  const { t } = useTranslation('common')

  return (
    <div className={styles.wrapper}>
      <button className={styles.orderBtn} onClick={onOrderClick}>
        {t('homePage.cta.orderOnline')}
      </button>
      <button className={styles.menuBtn}>
        {t('homePage.cta.menuAndPromos')}
      </button>
    </div>
  )
}

export default CtaButtons
