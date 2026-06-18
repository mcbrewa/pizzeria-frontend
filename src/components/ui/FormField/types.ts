export interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}
