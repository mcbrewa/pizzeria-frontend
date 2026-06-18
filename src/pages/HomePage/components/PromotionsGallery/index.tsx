import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PromotionsGalleryProps } from './types'
import styles from './style.module.scss'

const PromotionsGallery = ({ promotions }: PromotionsGalleryProps) => {
  const { t } = useTranslation('common')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlayKey, setAutoPlayKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % promotions.length)
    }, 5000)
    return () => clearInterval(id)
  }, [autoPlayKey, promotions.length])

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % promotions.length)
    setAutoPlayKey(k => k + 1)
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + promotions.length) % promotions.length)
    setAutoPlayKey(k => k + 1)
  }

  return (
    <div className={styles.gallery}>
      <div
        className={styles.track}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {promotions.map(promo => (
          <div
            key={promo.id}
            className={styles.slide}
            style={{ backgroundColor: promo.bgColor }}
          >
            <img src={promo.imageUrl} alt={promo.title} className={styles.image} />
            <div className={styles.overlay}>
              <p className={styles.subtitle}>{promo.subtitle}</p>
              <h2 className={styles.title}>{promo.title}</h2>
              <span className={styles.price}>{promo.price}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        className={styles.prevButton}
        onClick={handlePrev}
        aria-label={t('gallery.prevButton')}
      >
        ‹
      </button>
      <button
        className={styles.nextButton}
        onClick={handleNext}
        aria-label={t('gallery.nextButton')}
      >
        ›
      </button>

      <div className={styles.dots}>
        {promotions.map((_, i) => (
          <button
            key={i}
            className={i === currentIndex ? styles.dotActive : styles.dot}
            onClick={() => {
              setCurrentIndex(i)
              setAutoPlayKey(k => k + 1)
            }}
            aria-label={t('gallery.goToSlide', { n: i + 1 })}
          />
        ))}
      </div>
    </div>
  )
}

export default PromotionsGallery
