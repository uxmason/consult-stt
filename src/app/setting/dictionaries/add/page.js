"use client";
import Image from 'next/image'
import styles from '../page.module.css'
import ManagerInfoTicker from '../../../components/ManagerInfoTicker'
import HeadlineTicker from '../../../components/HeadlineTicker'
import CounselorInfoTicker from '../../../components/CounselorInfoTicker'
import Cookies from "js-cookie"
import jwt from "jsonwebtoken"
import Link from 'next/link'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import LeftMenuSetting from '../../../components/LeftMenuSetting'
import { toast } from "react-hot-toast"
import TopMenuTicker from '../../../components/TopMenuTicker';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const targetRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [isLoader, setLoader] = useState(false);
  const [isValidated0, setValidated0] = useState(false);
  const [keyword, setKeyword] = useState();

  useEffect(() => {
    const token = Cookies.get("token-stt");
    if (!token) {
      router.replace("/login/", {scroll: false});
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch("/api/protected", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Token validation failed");
      } catch (error) {
        console.log(error);
        router.replace("/login/", {scroll: false});
      }
    };

    validateToken();
  }, [router]);

  useEffect(() => {
    if(searchParams.get('index') != null) setIndexBoard(searchParams.get('index'));
  }, []);

  useLayoutEffect(() => {
    if(targetRef.current) {
      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight
      });
    }
  }, []);

  const updateDimensions = () => {
    if(targetRef.current) {
      setDimensions({
          width: targetRef.current.offsetWidth,
          height: targetRef.current.offsetHeight
      });
    }
  };
  const boostAddData = async () => {
    if(!isLoader) {
      try {
        setLoader(true);
        let url = `/api/setting/dictionaries/add`;
        const insert = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword: keyword,
            adminID: Cookies.get("USER_id")
          }),
        });
        const content = await insert.json();
        if(content.success) {
          setLoader(false);
          router.back();
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
    <Suspense fallback={<div>로딩 중...</div>}>
      <div className={'B00'}></div>
      <div className={'B01'}></div>
      <main>
        <div className={styles.C00}>
          <ManagerInfoTicker/>
          <HeadlineTicker/>
          <TopMenuTicker indexOfNav={{
            level: 'setting',
          }}/>
        </div>
        <div className={styles.C01} style={{height: dimensions.height+40+'px'}}>
          <LeftMenuSetting indexOfNav={{
            level: 'dictionaries',}}
          />
          <div className={styles.C02} ref={targetRef}>
            <div className={styles.C04}>
              <p className={'T09'} onClick={e => router.back()}><span className={'styleSheet isBack'}></span>뒤로</p>
              <p className={'T10'}>신규 사전 추가하기</p>
            </div>
            <div className={styles.C05}>
              <p className={styles.T01}>신규 키워드</p>
              <input className={styles.I00} maxLength={16} onChange={e => {
                (e.currentTarget.value.length >= 1) ? setValidated0(true) : setValidated0(false);
                setKeyword(e.currentTarget.value);
              }} />
              {isValidated0 ? <p className={styles.T03}>등록 가능합니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
              <div className={styles.C07} >
                <p className={styles.T00} onClick={e => {
                  if (isValidated0) boostAddData();
                }}>추가하기</p>
              </div>
            </div>
          </div>
          <div className={styles.C03} style={{height: dimensions.height+'px'}}>
            <div className={styles.C06}>
              <CounselorInfoTicker/>
            </div>
          </div>
        </div>
        {isLoader ? <div className={'loading'}>
          <div className={'loading-back'}></div>
          <Image className={'loading-img'} src='/img/loading.gif' width={400} height={300} alt='로딩' />
        </div> : null}
      </main>
    </Suspense>
  )
}