"use client";
export const dynamic = 'force-dynamic';
import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link'
import Cookies from "js-cookie"
import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import HeadlineTicker from '../../components/HeadlineTicker';
import ManagerInfoTicker from '../../components/ManagerInfoTicker';
import LeftMenuSetting from '../../components/LeftMenuSetting';
import CounselorInfoTicker from '../../components/CounselorInfoTicker';
import { toast } from "react-hot-toast"
import TopMenuTicker from '../../components/TopMenuTicker';

export default function Home() {
  const router = useRouter();
  const targetRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [isLoader, setLoader] = useState(true);
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
    setName(data.ADMIN_NAME);
    setBranchID(data.BRANCH_id);
    setRankID(data.RANK_id);
    setPositionID(data.POSITION_id);
    setUserNumber(data.USER_NUMBER);
    boostListDataBranches();
    boostListDataRank();
    boostListDataPosition();
  }, [data]);

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
    if(Cookies.get("USER_id")) {
      const USER_id = Cookies.get("USER_id");
      try {
        setLoader(true);
        let url = `/api/user/${USER_id}`;
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
    }
  };
  
  const boostEditData = async () => {
    const USER_id = Cookies.get("USER_id");
    if(!isLoader) {
      try {
        setLoader(true);
        let url = `/api/user/${USER_id}`;
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
    <>
      <div className={'B00'}></div>
      <div className={'B01'}></div>
      <main>
        <div className={styles.C05}>
          <ManagerInfoTicker/>
          <HeadlineTicker/>
          <TopMenuTicker indexOfNav={{
            level: 'setting',
          }}/>
        </div>
        <div className={styles.C06} style={{height: dimensions.height+63+'px'}}>
          <LeftMenuSetting indexOfNav={{
            level: 'myinfo',
          }}
          />
          <div className={styles.C07} ref={targetRef}>
            <div className={styles.C00}>
              <div className={styles.C02}>
                <div className={styles.C03}>
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
                  <p className={styles.T01}>365mc 사원번호</p>
                  <input defaultValue={data.USER_NUMBER} className={styles.I00} maxLength={7} onChange={e => {
                    setUserNumber(e.currentTarget.value);
                  }} />
                  <p className={styles.T05}>고객 상담 데이터와 연결됩니다.</p>
                </div>
                <div className={styles.C03}>
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
              <div className={styles.C04}>
                <p className={styles.T04} onClick={e => {
                  if(isValidated3 && isValidated4 && isValidated5 && isValidated6) {
                    boostEditData();
                  }
                }}>내 정보 수정하기</p>
              </div>
            </div>
          </div>
          <div className={styles.C08} style={{height: dimensions.height+22+'px'}}>
            <div className={styles.C09}>
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
