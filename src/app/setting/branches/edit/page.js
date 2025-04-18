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

export default function SettingBranchesEdit() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <EditContent />
    </Suspense>
  )
}

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const targetRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [isLoader, setLoader] = useState(false);
  const [isValidated0, setValidated0] = useState(false);
  const [isValidated1, setValidated1] = useState(false);
  const [textName, setTextName] = useState();
  const [textCode, setTextCode] = useState();

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
        toast.error(error);
        router.replace("/login/", {scroll: false});
      }
      boostGetData();
    };

    validateToken();
  }, [router]);

  useEffect(() => {
    if(textName) {
      (textName.length > 1) ? setValidated0(true) : setValidated0(false);
    }
    if(textCode) {
      (textCode.length > 1) ? setValidated1(true) : setValidated1(false);
    }
  }, [textName, textCode])

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
  const boostGetData = async () => {
    try {
      setLoader(true);
      let url = `/api/setting/branches/${searchParams.get('id')}`;
      const insert = await fetch(url, {
        method: 'GET',
      });
      const content = await insert.json();
      console.log(content)
      if(content.success) {
        setTextName(content.data.BRANCH_NAME);
        setTextCode(content.data.BRANCH_INFO_CODE);
        setLoader(false);
      }else {
        setLoader(false);
        toast.error(content.message);
      }
    } catch (error) {
      setLoader(false);
      toast.error(error.message);
    }
  };

  const boostEditData = async () => {
    if(!isLoader) {
      try {
        setLoader(true);
        let url = `/api/setting/branches/edit`;
        const insert = await fetch(url, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            id: searchParams.get('id'),
            textName: textName,
            textCode: textCode,
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
    <>
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
            level: 'branches',}}
          />
          <div className={styles.C02} ref={targetRef}>
            <div className={styles.C04}>
              <p className={'T09'} onClick={e => router.back()}><span className={'styleSheet isBack'}></span>뒤로</p>
              <p className={'T10'}>지점 수정하기</p>
            </div>
            <div className={styles.C05}>
              <p className={styles.T01}>지점 코드</p>
              <input className={styles.I00} maxLength={2} defaultValue={textCode} onChange={e => {
                (e.currentTarget.value.length > 1) ? setValidated1(true) : setValidated1(false);
                setTextCode(e.currentTarget.value);
              }} />
              {isValidated1 ? <p className={styles.T03}>등록 가능합니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
              <p className={styles.T01}>지점 이름</p>
              <input className={styles.I00} maxLength={16} defaultValue={textName} onChange={e => {
                (e.currentTarget.value.length > 1) ? setValidated0(true) : setValidated0(false);
                setTextName(e.currentTarget.value);
              }} />
              {isValidated0 ? <p className={styles.T03}>등록 가능합니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
              <div className={styles.C07} >
                <p className={styles.T00} onClick={e => {
                  if (isValidated0 && isValidated1) boostEditData();
                }}>수정하기</p>
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
    </>
  )
}