import clsx from 'clsx'
import styles from './style.module.scss'
import type { FormFieldProps } from './types'

const FormField = ({ label, name, type = 'text', value, onChange, required, placeholder, className }: FormFieldProps) => (
  <div className={clsx(styles.field, className)}>
    <label htmlFor={name} className={styles.label}>
      {label}
      {required && <span className={styles.required} aria-hidden="true">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={styles.input}
      aria-required={required}
    />
  </div>
)

export default FormField
