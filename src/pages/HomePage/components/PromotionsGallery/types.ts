export interface Promotion {
  id: string | number
  title: string
  subtitle: string
  price: string
  imageUrl: string
  bgColor: string
}

export interface PromotionsGalleryProps {
  promotions: Promotion[]
}
