import Image from 'next/image'
import styles from './HeadlineTicker.module.css'
import Link from 'next/link'

export default function HeadlineTicker() {
  return (
    <Link href="/" scroll={false}>
      <div className={styles.C00}>
        <div className={`${styles.C01} styleSheet`}></div>
        <div className={`${styles.C02} styleSheet`}></div>
      </div>
    </Link>
  )
}
