"use client"; 
import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import HeadlineTicker from '../components/HeadlineTicker';
import { toast } from "react-hot-toast"

export default function Home() {
  const router = useRouter();
  const [isLoader, setLoader] = useState(false);
  const [dataBranches, setDataBranches] = useState([]);
  const [dataRank, setDataRank] = useState([]);
  const [dataPosition, setDataPosition] = useState([]);
  const [ID, setID] = useState();
  const [name, setName] = useState();
  const [password, setPassword] = useState();
  const [passwordCheck, setPasswordCheck] = useState();
  const [branchID, setBranchID] = useState();
  const [rankID, setRankID] = useState();
  const [positionID, setPositionID] = useState();
  const [userNumber, setUserNumber] = useState();
  const [isValidated0, setValidated0] = useState(false);
  const [isValidated1, setValidated1] = useState(false);
  const [isValidated2, setValidated2] = useState(false);
  const [isValidated3, setValidated3] = useState(false);
  const [isValidated4, setValidated4] = useState(false);
  const [isValidated5, setValidated5] = useState(false);
  const [isValidated6, setValidated6] = useState(false);

  useEffect(() => {
    boostListDataBranches();
    boostListDataRank();
    boostListDataPosition();
  }, []);
  
  const boostSign = async () => {
    if(!isLoader) {
      try {
        setLoader(true);
        let url = `/api/sign`;
        const insert = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ID: ID,
            name: name,
            password: password,
            branchID: branchID,
            rankID: rankID,
            positionID: positionID,
            userNumber: userNumber
          }),
        });
        const content = await insert.json();
        if(content.success) {
          setLoader(false);
          router.push('/login/', { scroll: false });
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
        <div className={styles.C00}>
          <div className={styles.C01}>
            <HeadlineTicker/>
            <p className={styles.T00}>관리자 회원가입</p>
          </div>
          <div className={styles.C02}>
            <div className={styles.C03}>
              <p className={styles.T01}>아이디</p>
              <input className={styles.I00} maxLength={16} onChange={e => {
                (e.currentTarget.value.length > 1) ? setValidated0(true) : setValidated0(false);
                setID(e.currentTarget.value);
              }} />
              {isValidated0 ? <p className={styles.T03}>등록 가능합니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
              <p className={styles.T01}>이름</p>
              <input className={styles.I00} maxLength={16} onChange={e => {
                (e.currentTarget.value.length > 1) ? setValidated6(true) : setValidated6(false);
                setName(e.currentTarget.value);
              }} />
              {isValidated6 ? <p className={styles.T03}>등록 가능합니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
              <p className={styles.T01}>비밀번호</p>
              <input type="password" className={styles.I00} maxLength={16} onChange={e => {
                (e.currentTarget.value.length > 1) ? setValidated1(true) : setValidated1(false);
                (e.currentTarget.value == passwordCheck) ? setValidated2(true) : setValidated2(false);
                setPassword(e.currentTarget.value);
              }} />
              {isValidated1 ? <p className={styles.T03}>등록 가능합니다.</p> : <p className={styles.T02}>글자수가 모자랍니다.</p> }
              <p className={styles.T01}>비밀번호 확인</p>
              <input type="password" className={styles.I00} maxLength={16} onChange={e => {
                (e.currentTarget.value == password) ? setValidated2(true) : setValidated2(false);
                setPasswordCheck(e.currentTarget.value);
              }} />
              {isValidated2 ? <p className={styles.T03}>비밀번호가 일치합니다.</p> : <p className={styles.T02}>비밀번호가 일치하지 않습니다.</p> }
            </div>
            <div className={styles.C03}>
              <p className={styles.T01}>소속 지점</p>
              <select className={styles.S00} onChange={e => {
                setBranchID(e.target.value);
                (e.target.value != 0) ? setValidated3(true) : setValidated3(false)
              }}>
                <option value={0}>선택해주세요.</option>
                {dataBranches && dataBranches.map((item, index) => {
                  return(<option key={index} value={item._id}>{item.BRANCH_NAME}</option>)
                })}
              </select>
              {isValidated3 ? <p className={styles.T03}>선택완료</p> : <p className={styles.T02}>아직 선택하지 않았습니다.</p> }
              <p className={styles.T01}>직급</p>
              <select className={styles.S00} onChange={e => {
                setRankID(e.target.value);
                (e.target.value != 0) ? setValidated4(true) : setValidated4(false)
              }}>
                <option value={0}>선택해주세요.</option>
                {dataRank && dataRank.map((item, index) => {
                  return(<option key={index} value={item._id}>{item.RANK_NAME}</option>)
                })}
              </select>
              {isValidated4 ? <p className={styles.T03}>선택완료</p> : <p className={styles.T02}>아직 선택하지 않았습니다.</p> }
              <p className={styles.T01}>직책</p>
              <select className={styles.S00} onChange={e => {
                setPositionID(e.target.value);
                (e.target.value != 0) ? setValidated5(true) : setValidated5(false)
              }}>
                <option value={0}>선택해주세요.</option>
                {dataPosition && dataPosition.map((item, index) => {
                  return(<option key={index} value={item._id}>{item.POSITION_NAME}</option>)
                })}
              </select>
              {isValidated5 ? <p className={styles.T03}>선택완료</p> : <p className={styles.T02}>아직 선택하지 않았습니다.</p> }
              <p className={styles.T01}>365mc 사원번호 (선택사항)</p>
              <input className={styles.I00} maxLength={7} onChange={e => {
                setUserNumber(e.currentTarget.value);
              }} />
              <p className={styles.T05}>사원번호가 없으면 상담이 저장되지 않습니다.</p>
            </div>
          </div>
          <div>
            <div className={styles.C04}>
              <p className={styles.T04} onClick={e => {
                if(isValidated0 && isValidated1 && isValidated2 && isValidated3 && isValidated4 && isValidated5 && isValidated6) {
                  boostSign();
                }
              }}>회원가입</p>
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
