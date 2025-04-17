"use client";
export const dynamic = 'force-dynamic';
import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from "react-hot-toast"

export default function Home() {
  const router = useRouter();
  const [isLoader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [ID, setID] = useState();
  const [password, setPassword] = useState();
  const [isValidated0, setValidated0] = useState(false);
  const [isValidated1, setValidated1] = useState(false);
  
  const boostLogin = async () => {
    if(!isLoader) {
      try {
        setLoader(true);
        let url = `/api/login`;
        const insert = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ID: ID,
            password: password
          }),
        });
        const content = await insert.json();
        if(content.success) {
          setLoader(false);
          document.cookie = `token-stt=${content.token}; path=/`;
          document.cookie = `USER_id=${content.USER_id}; path=/`;
          document.cookie = `POSITION_id=${content.POSITION_id}; path=/`;
          router.push('/', { scroll: false });
        }else {
          setLoader(false);
          toast.error(content.message);
        }
      } catch (error) {
        setLoader(false);
        toast.error(error.message);
      }
    }
  };
  return (
    <>
      <div className={'B00'}></div>
      <div className={'B01'}></div>
      <main>
        <div className={styles.C00}>
          <div className={styles.C01}>
            <p className={styles.T00}>관리자 로그인</p>
          </div>
          <div className={styles.C02}>
            <p className={styles.T01}>아이디</p>
            <input className={styles.I00} maxLength={16} onChange={e => {
              (e.currentTarget.value.length > 1) ? setValidated0(true) : setValidated0(false);
              setID(e.currentTarget.value);
            }} />
            {isValidated0 ? <p className={styles.T03}>유효한 아이디입니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
            <p className={styles.T01}>비밀번호</p>
            <input type="password" className={styles.I00} maxLength={16} onChange={e => {
              (e.currentTarget.value.length > 0) ? setValidated1(true) : setValidated1(false);
              setPassword(e.currentTarget.value);
            }} onKeyDown={e => {
              if(e.key === 'Enter') {
                if(isValidated0 && isValidated1) {
                  boostLogin();
                }
              }
            }} />
            {isValidated1 ? <p className={styles.T03}>유효한 비밀번호입니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
            <div className={styles.C04}>
              <div className={styles.C05}>
                <Link href={'/sign/'} scroll={false}><p className={`${styles.T04} ${styles.isSign}`}>회원가입</p></Link>
              </div>
              <div className={styles.C05}>
                <p className={styles.T04} onClick={e => {
                  if(isValidated0 && isValidated1) {
                    boostLogin();
                  }
                }}>로그인</p>
              </div>
            </div>
          </div>
        </div>
        {isLoader ? <div className={'loading'}>
          <div className={'loading-back'}></div>
          <Image className={'loading-img'} src='/img/loading.gif' width={400} height={300} alt='로딩' />
        </div> : null}
      </main>
    </>
  )
}
