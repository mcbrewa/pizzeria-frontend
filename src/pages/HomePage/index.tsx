import PromotionsGallery from './components/PromotionsGallery'
import { PROMOTIONS } from './data'

const HomePage = () => {
  return (
    <div>
      <PromotionsGallery promotions={PROMOTIONS} />
    </div>
  )
}

export default HomePage
