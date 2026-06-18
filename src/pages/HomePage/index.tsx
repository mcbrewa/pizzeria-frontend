import { useState } from 'react'
import PromotionsGallery from './components/PromotionsGallery'
import CtaButtons from './components/CtaButtons'
import OrderPanel from './components/OrderPanel'
import { PROMOTIONS } from './data'
import styles from './styles.module.scss'

const HomePage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.mainArea}>
        <PromotionsGallery promotions={PROMOTIONS} />
        <CtaButtons onOrderClick={() => setIsDrawerOpen(true)} />
      </div>
      <OrderPanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}

export default HomePage
