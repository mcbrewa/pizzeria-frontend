import HeaderItem from '../HeaderItem'
import style from './style.module.scss'

const headerItemData = [
  { key: 'nav.menuAndPromotions', to: '/menu' },
  { key: 'nav.locations', to: '/locations' },
  { key: 'nav.trackOrder', to: '/track-order' },
  { key: 'nav.blog', to: '/blog' },
  { key: 'nav.work', to: '/jobs' },
  { key: 'nav.contact', to: '/contact' },
]

const HeaderList = () => {
  return (
    <ul className={style.list}>
      {headerItemData.map((item) => (
        <HeaderItem key={item.key} translationKey={item.key} to={item.to} />
      ))}
    </ul>
  )
}

export default HeaderList
