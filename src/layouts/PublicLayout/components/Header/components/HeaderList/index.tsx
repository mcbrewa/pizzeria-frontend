import HeaderItem from '../HeaderItem'
import { NAV_ITEMS } from '../../data'
import style from './style.module.scss'

const HeaderList = () => {
  return (
    <ul className={style.list}>
      {NAV_ITEMS.map((item) => (
        <HeaderItem key={item.key} translationKey={item.key} to={item.to} disabled={item.disabled} />
      ))}
    </ul>
  )
}

export default HeaderList
