import { useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../../hooks/useAuth'
import { useResizeTransitionBlock } from '../../../../hooks/useResizeTransitionBlock'
import TabSwitcher from './components/TabSwitcher'
import DeliveryForm from './components/DeliveryForm'
import PickupForm from './components/PickupForm'
import styles from './style.module.scss'
import type { OrderPanelProps, OrderTab } from './types'

const OrderPanel = ({ isOpen, onClose }: OrderPanelProps) => {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<OrderTab>('delivery')
  useResizeTransitionBlock()

  return (
    <div className={clsx(styles.panel, isOpen && styles.panelOpen)}>
      <div className={styles.mobileHeader}>
        <button className={styles.backBtn} onClick={onClose} aria-label={t('orderPanel.back')}>
          ←
        </button>
        <span className={styles.mobileTitle}>{t('orderPanel.orderOnline')}</span>
      </div>

      <div className={styles.desktopHeader}>
        {user && (
          <span className={styles.greeting}>
            {t('orderPanel.greeting', { name: user.firstName })}
          </span>
        )}
        <span className={styles.orderOnline}>{t('orderPanel.orderOnline')}</span>
      </div>

      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'delivery' ? <DeliveryForm /> : <PickupForm />}
    </div>
  )
}

export default OrderPanel
