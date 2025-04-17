import Image from 'next/image'
import styles from './TopMenuTicker.module.css'
import Link from 'next/link'

export default function TopMenuTicker(props) {
  return (
    <div className={styles.C00}>
      <Link href="/emrConsult/" scroll={false}>
        <p className={`${styles.P00} ${props.indexOfNav.level == 'emrConsult' ? styles.isSelected:null}`}>EMR기록</p>
      </Link>
      <Link href="/consult/" scroll={false}>
        <p className={`${styles.P00} ${props.indexOfNav.level == 'consult' ? styles.isSelected:null}`}>상담목록</p>
      </Link>
      <Link href="/words/" scroll={false}>
        <p className={`${styles.P00} ${props.indexOfNav.level == 'words' ? styles.isSelected:null}`}>단어목록</p>
      </Link>
      <Link href="/setting/myinfo/" scroll={false}>
        <p className={`${styles.P00} ${props.indexOfNav.level == 'setting' ? styles.isSelected:null}`}>설정</p>
      </Link>
    </div>
  )
}
