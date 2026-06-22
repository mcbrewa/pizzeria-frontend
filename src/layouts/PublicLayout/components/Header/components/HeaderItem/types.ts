export type HeaderItemVariant = 'nav' | 'drawer'

export type HeaderItemProps = {
  translationKey: string
  to: string
  disabled?: boolean
  onClick?: () => void
  variant?: HeaderItemVariant
}
