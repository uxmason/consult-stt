import Image from 'next/image'
import styles from './ManagerInfoTicker.module.css'
import { useEffect, useRef, useState } from 'react';
import Cookies from "js-cookie"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from "react-hot-toast"

export default function ManagerInfoTicker() {
  const router = useRouter();
  const refTicker = useRef(null);
  const [isLoader, setLoader] = useState(false);
  const [isShowTicker, setShowTicker] = useState(false);
  const [dataUser, setDataUser] = useState([]);

  useEffect(() => {
    if(!isLoader) {
      boostGetUser();
    }
  }, [])

  useEffect(() => {
    const handleOutSideClick = e => {
      if (!refTicker.current?.contains(e.target)) {
        setShowTicker(false);
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {window.removeEventListener("mousedown", handleOutSideClick);}
  }, [refTicker]);

  const boostGetUser = async () => {
    if(Cookies.get("USER_id")) {
      const userID = Cookies.get("USER_id");
      try {
        setLoader(true);
        let url = `/api/user/${userID}/completed/`;
        const select = await fetch(url, {
          method: 'GET',
        });
        const content = await select.json();
        if(content.success) {
          setDataUser(content.data);
          setLoader(false);
        }else {
          setDataUser([]);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);
        toast.error(error.message);
      }
    }else {
      router.replace('/login/', {scroll:false})
    }
  };

  return (
    <div className={styles.C00}>
      <div className={`${styles.C01} styleSheet`}></div>
      <div className={styles.C02}>
        <p className={styles.T00}><span className={styles.isBranch}>{dataUser ? dataUser.BRANCH_NAME : '(등록안됨)'}</span> {dataUser ? dataUser.POSITION_NAME : '(등록안됨)'}</p>
        <p className={styles.T01}>{dataUser ? dataUser.ADMIN_NAME: '(등록안됨)'} <span className={styles.isRank}>{dataUser? dataUser.RANK_NAME : '(등록안됨)'}</span></p>
      </div>
      <div className={`${styles.C03} styleSheet`} ref={refTicker} style={{transform: isShowTicker ? 'rotate(180deg)' : null}} onClick={e => {
        if(isShowTicker) {
          setShowTicker(false);
        }else {
          setShowTicker(true);
        }
      }}></div>
      <div className={styles.C04} style={{
        opacity: isShowTicker ? 1 : 0,
        top: isShowTicker ? 60 : 50,
        }}>
        <Link href="/setting/myinfo/" scroll={false} style={{
          cursor: isShowTicker ? 'pointer' : 'auto'}}>
          <p className={styles.T02} style={{
            pointerEvents: isShowTicker ? 'auto' : 'none'}}>내 정보 수정</p></Link>
          <p className={`${styles.T02} ${styles.isNotBorder}`} onClick={e => {
            if(!isShowTicker) {
              document.cookie = 'token-stt=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              document.cookie = 'USER_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              document.cookie = 'POSITION_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              router.replace('/login/', {scroll:false})
            }
          }} style={{cursor: isShowTicker ? 'pointer' : 'auto'}}>로그아웃</p>
      </div>
    </div>
  )
}
