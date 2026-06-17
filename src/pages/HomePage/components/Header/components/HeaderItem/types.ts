export type HeaderItemVariant = 'nav' | 'drawer'

export type HeaderItemProps = {
  translationKey: string
  to: string
  onClick?: () => void
  variant?: HeaderItemVariant
}
