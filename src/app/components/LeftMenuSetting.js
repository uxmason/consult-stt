import Image from 'next/image'
import styles from './LeftMenuSetting.module.css'
import Link from 'next/link'
import Cookies from "js-cookie"
import { useEffect, useState } from 'react'

export default function LeftMenuSetting(props) {
  const [userID, setUserID] = useState();

  useEffect(() => {
    setUserID(Cookies.get("USER_id"));
  }, [])
  return (
    <div className={styles.C00}>
      <div className={styles.C01}>
        <Link href={`/setting/myinfo/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'myinfo' ? styles.isSelected:null}`}>내 정보</p></Link>
        <Link href={`/setting/dictionaries/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'dictionaries' ? styles.isSelected:null}`}>키워드 관리</p></Link>
        <Link href={`/setting/clients/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'clients' ? styles.isSelected:null}`}>고객 관리</p></Link>
        {userID == 1 ? <>
          <Link href={`/setting/admins/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'admins' ? styles.isSelected:null}`}>상담사 관리</p></Link>
          <Link href={`/setting/rooms/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'rooms' ? styles.isSelected:null}`}>상담실 관리</p></Link>
          <Link href={`/setting/branches/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'branches' ? styles.isSelected:null}`}>지점 관리</p></Link>
          <Link href={`/setting/position/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'position' ? styles.isSelected:null}`}>직책 관리</p></Link>
          <Link href={`/setting/rank/`} scroll={false}><p className={`${styles.T00} ${props.indexOfNav.level == 'rank' ? styles.isSelected:null}`}>직급 관리</p></Link>
        </> : null }
      </div>
    </div>
  )
}
