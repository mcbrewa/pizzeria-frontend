import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../../../../../../components/ui/FormField'
import styles from './style.module.scss'

const DeliveryForm = () => {
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
      <FormField
        label={t('orderPanel.fields.city')}
        name="city"
        value={city}
        onChange={setCity}
        required
      />
      <FormField
        label={t('orderPanel.fields.street')}
        name="street"
        value={street}
        onChange={setStreet}
        required
      />
      <div className={styles.row}>
        <FormField
          label={t('orderPanel.fields.houseNumber')}
          name="houseNumber"
          value={houseNumber}
          onChange={setHouseNumber}
          required
        />
        <FormField
          label={t('orderPanel.fields.apartmentNumber')}
          name="apartmentNumber"
          value={apartmentNumber}
          onChange={setApartmentNumber}
        />
      </div>
      <button type="submit" className={styles.primaryBtn}>
        {t('orderPanel.actions.next')}
      </button>
    </form>
  )
}

export default DeliveryForm
