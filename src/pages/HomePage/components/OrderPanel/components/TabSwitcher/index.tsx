import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import styles from './style.module.scss'
import type { OrderTab } from '../../types'

interface TabSwitcherProps {
  activeTab: OrderTab
  onTabChange: (tab: OrderTab) => void
}

const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  const { t } = useTranslation('common')

  return (
    <div className={styles.wrapper}>
      <div className={styles.activeIcon} aria-hidden="true">
        <span className={styles.activeIconEmoji}>
          {activeTab === 'delivery' ? '🛵' : '🏪'}
        </span>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'delivery'}
          className={clsx(styles.tab, activeTab === 'delivery' && styles.tabActive)}
          onClick={() => onTabChange('delivery')}
        >
          <span className={styles.tabIcon} aria-hidden="true">🛵</span>
          <span className={styles.timeBadge}>~30 min</span>
          <span className={styles.tabLabel}>{t('orderPanel.tabs.delivery')}</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'pickup'}
          className={clsx(styles.tab, activeTab === 'pickup' && styles.tabActive)}
          onClick={() => onTabChange('pickup')}
        >
          <span className={styles.tabIcon} aria-hidden="true">🏪</span>
          <span className={styles.timeBadge}>~15 min</span>
          <span className={styles.tabLabel}>{t('orderPanel.tabs.pickup')}</span>
        </button>
      </div>

      <div className={styles.indicator} />
    </div>
  )
}

export default TabSwitcher
