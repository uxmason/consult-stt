"use client"; export const dynamic = 'force-dynamic'; 
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
  const searchParams = useSearchParams();
  const targetRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [isLoader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [dataBranches, setDataBranches] = useState([]);
  const [dataRank, setDataRank] = useState([]);
  const [dataPosition, setDataPosition] = useState([]);
  const [name, setName] = useState();
  const [branchID, setBranchID] = useState();
  const [rankID, setRankID] = useState();
  const [positionID, setPositionID] = useState();
  const [userNumber, setUserNumber] = useState();
  const [isValidated3, setValidated3] = useState(true);
  const [isValidated4, setValidated4] = useState(true);
  const [isValidated5, setValidated5] = useState(true);
  const [isValidated6, setValidated6] = useState(true);
  const [userID, setUserID] = useState();

  useEffect(() => {
    setUserID(Cookies.get("USER_id"));
    setName(data.ADMIN_NAME);
    setBranchID(data.BRANCH_id);
    setRankID(data.RANK_id);
    setPositionID(data.POSITION_id);
    setUserNumber(data.USER_NUMBER);
    boostListDataBranches();
    boostListDataRank();
    boostListDataPosition();
  }, [data]);

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

  useLayoutEffect(() => {
    if(targetRef.current) {
      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight
      });
    }
  }, []);

  useEffect(() => {
    if(userID && userID != 1) router.replace("/", {scroll: false});
  }, [userID])

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
      let url = `/api/setting/admins/${searchParams.get('id')}`;
      const insert = await fetch(url, {
        method: 'GET',
      });
      const content = await insert.json();
      if(content.success) {
        setData(content.data);
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
        let url = `/api/setting/admins/${searchParams.get('id')}`;
        const insert = await fetch(url, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
            branchID: branchID,
            rankID: rankID,
            positionID: positionID,
            userNumber: userNumber
          }),
        });
        const content = await insert.json();
        if(content.success) {
          setLoader(false);
          toast.success('수정이 완료되었습니다.');
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

  const boostListDataBranches = async () => {
    try {
      setLoader(true);
      let url = `/api/setting/branches/all`;
      const select = await fetch(url, {
        method: 'GET',
      });
      const content = await select.json();
      if(content.success) {
        setDataBranches(content.data);
        setLoader(false);
      }else {
        setDataBranches([]);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      toast.error(error.message);
    }
  };

  const boostListDataRank = async () => {
    try {
      setLoader(true);
      let url = `/api/setting/rank/all`;
      const select = await fetch(url, {
        method: 'GET',
      });
      const content = await select.json();
      if(content.success) {
        setDataRank(content.data);
        setLoader(false);
      }else {
        setDataRank([]);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      toast.error(error.message);
    }
  };

  const boostListDataPosition = async () => {
    try {
      setLoader(true);
      let url = `/api/setting/position/all`;
      const select = await fetch(url, {
        method: 'GET',
      });
      const content = await select.json();
      if(content.success) {
        setDataPosition(content.data);
        setLoader(false);
      }else {
        setDataPosition([]);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      toast.error(error.message);
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
            level: 'admins',}}
          />
          <div className={styles.C02} ref={targetRef}>
            <div className={styles.C04}>
              <p className={'T09'} onClick={e => router.back()}><span className={'styleSheet isBack'}></span>뒤로</p>
              <p className={'T10'}>상담사 정보 수정하기</p>
            </div>
            <div className={styles.C05}>
              <div className={styles.C08}>
                <div className={styles.C09}>
                  <div className={styles.C10}>
                    <p className={styles.T01}>이름</p>
                    <input defaultValue={data.ADMIN_NAME} className={styles.I00} maxLength={16} onChange={e => {
                      (e.currentTarget.value.length > 1) ? setValidated6(true) : setValidated6(false);
                      setName(e.currentTarget.value);
                    }} />
                    {isValidated6 ? <p className={styles.T03}>유효합니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
                    <p className={styles.T01}>소속 지점</p>
                    {data.BRANCH_id ? <select defaultValue={data.BRANCH_id} className={styles.S00} onChange={e => {
                      setBranchID(e.target.value);
                      (e.target.value != 0) ? setValidated3(true) : setValidated3(false)
                    }}>
                      <option value={0}>선택해주세요.</option>
                      {dataBranches && dataBranches.map((item, index) => {
                        return(<option key={index} value={item._id}>{item.BRANCH_NAME}</option>)
                      })}
                    </select> : <input className={styles.I00}/> }
                    {isValidated3 ? <p className={styles.T03}>선택완료</p> : <p className={styles.T02}>아직 선택하지 않았습니다.</p> }
                    <p className={styles.T01}>365mc 사원번호 (선택사항)</p>
                    <input defaultValue={data.USER_NUMBER} className={styles.I00} maxLength={7} onChange={e => {
                      setUserNumber(e.currentTarget.value);
                    }} />
                    <p className={styles.T05}>사원번호가 없으면 상담이 저장되지 않습니다.</p>
                  </div>
                  <div className={styles.C10}>
                    <p className={styles.T01}>직급</p>
                    {data.RANK_id ? <select defaultValue={data.RANK_id} className={styles.S00} onChange={e => {
                      setRankID(e.target.value);
                      (e.target.value != 0) ? setValidated4(true) : setValidated4(false)
                    }}>
                      <option value={0}>선택해주세요.</option>
                      {dataRank && dataRank.map((item, index) => {
                        return(<option key={index} value={item._id}>{item.RANK_NAME}</option>)
                      })}
                    </select> : <input className={styles.I00}/> }
                    {isValidated4 ? <p className={styles.T03}>선택완료</p> : <p className={styles.T02}>아직 선택하지 않았습니다.</p> }
                    <p className={styles.T01}>직책</p>
                    {data.POSITION_id ? <select defaultValue={data.POSITION_id} className={styles.S00} onChange={e => {
                      setPositionID(e.target.value);
                      (e.target.value != 0) ? setValidated5(true) : setValidated5(false)
                    }}>
                      <option value={0}>선택해주세요.</option>
                      {dataPosition && dataPosition.map((item, index) => {
                        return(<option key={index} value={item._id}>{item.POSITION_NAME}</option>)
                      })}
                    </select> : <input className={styles.I00}/> }
                    {isValidated5 ? <p className={styles.T03}>선택완료</p> : <p className={styles.T02}>아직 선택하지 않았습니다.</p> }
                  </div>
                </div>
                <div className={styles.C07} >
                  <p className={styles.T00} onClick={e => {
                    if (isValidated3 && isValidated4 && isValidated5 && isValidated6) boostEditData();
                  }}>수정하기</p>
                </div>
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