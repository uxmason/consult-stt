"use client"; export const dynamic = 'force-dynamic'; 
import Image from 'next/image'
import styles from './page.module.css'
import ManagerInfoTicker from './components/ManagerInfoTicker'
import HeadlineTicker from './components/HeadlineTicker'
import CounselorInfoTicker from './components/CounselorInfoTicker'
import TopMenuTicker from './components/TopMenuTicker';
import Link from 'next/link'
import Cookies from "js-cookie"
import jwt from "jsonwebtoken"
import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toast } from "react-hot-toast"

export default function Home() {
  const router = useRouter();
  const targetRef = useRef();
  const [data, setData] = useState([]);
  const [isLoader, setLoader] = useState(false);
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [userID, setUserID] = useState();
  const [positionID, setPositionID] = useState();

  useEffect(() => {
    const token = Cookies.get("token-stt");
    if (!token) {
      if(Cookies.get("USER_id")) {
        document.cookie = 'USER_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
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
    if(Cookies.get("USER_id")) {
      setUserID(Cookies.get("USER_id"));
    }
    if(Cookies.get("POSITION_id")) {
      setPositionID(Cookies.get("POSITION_id"));
    }
  }, []);

  useEffect(() => {
    if(userID && positionID) {
      boostListData();
    }
  }, [userID, positionID])
  
  useEffect(() => {
    updateDimensions();
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

  const boostListData = async () => {
    try {
      setLoader(true);
      let url = `/api/consult/`;
      if(positionID != 11) url = `/api/consult/list/${userID}`;
      const select = await fetch(url, {
        method: 'GET',
      });
      const content = await select.json();
      if(content.success) {
        setData(content.data);
        setLoader(false);
      }else {
        setLoader(false);
        toast.error(content.message);
        router.refresh();
      }
    } catch (error) {
      setLoader(false);
      toast.error(error.message);
    }
  };

  const getAge = s => {
    const today = new Date();
    const index = Number(s.substring(6,7));
    let tempYear = '20'
    if(index == 1 || index == 2 || index == 5 || index == 6) {
        tempYear = '19'
    }
    const birthDate = new Date(tempYear+s.substring(0,2)+'-'+s.substring(2,4)+'-'+s.substring(4,6));
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  const getSex = s => {
    const index = Number(s.substring(6,7));
    if(index == 1 || index == 3 || index == 5 || index == 7) {
      return '남';
    } else {
      return '여';
    }
  }
  const getDateTime = (s, correction) => {
    if(s) {
      let d = new Date(s);
      d.setHours(d.getHours() + correction);
      return d.toISOString().replace('T', ' ').substring(2, 16);
    } else {
      return '';
    }
  }
  const returnTimeHHMM = n => {
    const s = new Date(n).toISOString();
    if(n >= 60 * 60 * 1000) {
      return `${s.substring(12,13)}시간 ${s.substring(14,16)}분`;
    }else {
      if(n >= 10 * 60 * 1000) {
        return `${s.substring(14,16)}분`;
      }else {
        return `${s.substring(15,16)}분`;
      }
    }
  }
  return (
    <>
      <div className={'B00'}></div>
      <div className={'B01'}></div>
      <main>
        <div className={styles.C00}>
          <ManagerInfoTicker/>
          <HeadlineTicker/>
          <TopMenuTicker indexOfNav={{}}/>
        </div>
        <div className={styles.C01}>
          <div className={styles.C02} ref={targetRef}>
            <div className={styles.C05}>
              <div className={'C02 isOpacity isMini isUnderline isShort'}>
                <p className={'T05 P20'}>고객번호</p>
                <p className={'T05 P20'}>고객정보</p>
                <p className={'T05 P20'}>상담일시</p>
                <p className={'T05 P20'}>{positionID == 11 ? '상담사 정보' : '상담시간' }</p>
                <p className={'T05 P20'}>작업현황</p>
              </div>
              <div className={'C05'}>
                {data && data.map((item, index) => {
                  return <Link key={index} href={`/consult/detail/${item.CONSULT_id}`} scroll={false}>
                    <div className={'C02'}>
                      <p className={'T05 P20'}>{positionID == 11 ? <>ㅤ<span className={'isBranch'}>{item.BRANCH_NAME}</span><span className={'isPsentry'}>{item.PSENTRY}</span></> : <>{item.PSENTRY}</>}</p>
                      <p className={'T05 P20'}>{item.PSNAME}<span className={`isSex ${getSex(item.LICENSE) == '여' ? 'isRed' : 'isBlue'}`}>{getSex(item.LICENSE)}</span>{getAge(item.LICENSE)}<span className={'isAgeUnit'}>세</span></p>
                      <p className={'T05 P20'}>{positionID == 11 ? <>ㅤ<span className={'isStartTime'}>{getDateTime(item.START_TIME, 0)}</span><span className={'isPsentry'}><span className={'isThin'}>시간:</span> {returnTimeHHMM(new Date(item.END_TIME).getTime() - new Date(item.START_TIME).getTime())}</span></> : getDateTime(item.START_TIME, 0)}</p>
                      <p className={'T05 P20'}>{positionID == 11 ? <>{item.ADMIN_NAME}<span className={'isPosition'}>{item.POSITION_NAME}</span></> : returnTimeHHMM(new Date(item.END_TIME).getTime() - new Date(item.START_TIME).getTime())}</p>
                      <p className={'T05 P20'}>{item.STATUS_NUMBER == 0 
                      ? <span className={'isStatus'}>미열람</span>
                      : item.STATUS_NUMBER == 1
                      ? <span className={'isStatus isContinue'}>편집대기</span>
                      : <span className={'isStatus isComplete'}>편집완료</span> }
                      {/* <span className={"C03"}>음성기록<span className={'styleSheet isPlay'}></span></span> */}
                      </p>
                    </div>
                  </Link>
                })}
              </div>
              <div className={styles.C04}>
                <Link href="/consult/" scroll={false}><p className={styles.T00}>이전 상담 더보기</p></Link>
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
