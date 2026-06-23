import { useTranslation } from 'react-i18next'
import styles from './style.module.scss'

const NotFoundPage = () => {
  const { t } = useTranslation('common')

  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.title}>{t('notFoundPage.title')}</p>
      <p className={styles.subtitle}>{t('notFoundPage.subtitle')}</p>
    </div>
  )
}

export default NotFoundPage
