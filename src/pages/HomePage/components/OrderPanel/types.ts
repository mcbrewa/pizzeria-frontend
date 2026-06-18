export type OrderTab = 'delivery' | 'pickup'

export interface OrderPanelProps {
  isOpen: boolean
  onClose: () => void
}
