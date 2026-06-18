import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../../../../../../components/ui/FormField'
import styles from './style.module.scss'

const PickupForm = () => {
  const { t } = useTranslation('common')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [apartmentNumber, setApartmentNumber] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.subtitle}>{t('orderPanel.pickup.subtitle')}</p>
      <FormField
        label={t('orderPanel.fields.city')}
        name="pickup-city"
        value={city}
        onChange={setCity}
        required
      />
      <FormField
        label={t('orderPanel.fields.street')}
        name="pickup-street"
        value={street}
        onChange={setStreet}
        required
      />
      <div className={styles.row}>
        <FormField
          label={t('orderPanel.fields.houseNumber')}
          name="pickup-houseNumber"
          value={houseNumber}
          onChange={setHouseNumber}
          required
        />
        <FormField
          label={t('orderPanel.fields.apartmentNumber')}
          name="pickup-apartmentNumber"
          value={apartmentNumber}
          onChange={setApartmentNumber}
        />
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.primaryBtn}>
          {t('orderPanel.actions.next')}
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => console.log('find on map')}
        >
          {t('orderPanel.actions.findOnMap')}
        </button>
      </div>
    </form>
  )
}

export default PickupForm
