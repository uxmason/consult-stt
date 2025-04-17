"use client";
import Image from 'next/image'
import styles from './page.module.css'
import ManagerInfoTicker from '../components/ManagerInfoTicker'
import HeadlineTicker from '../components/HeadlineTicker'
import CounselorInfoTicker from '../components/CounselorInfoTicker'
import Cookies from "js-cookie"
import jwt from "jsonwebtoken"
import Link from 'next/link'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toast } from "react-hot-toast"
import TopMenuTicker from '../components/TopMenuTicker';

export default function Consult() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <Content />
    </Suspense>
  )
}

function Content() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const targetRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [isLoader, setLoader] = useState(false);
  const [indexBoard, setIndexBoard] = useState(1);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [boardNumbers, setBoardNumbers] = useState([]);
  const [userID, setUserID] = useState();
  const [positionID, setPositionID] = useState();

  const [psEntry, setPsEntry] = useState('');
  const [psName, setPsName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sorting, setSorting] = useState(0);

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
    if(searchParams.get('psEntry') != null) setPsEntry(searchParams.get('psEntry'));
    if(searchParams.get('psName') != null) setPsName(searchParams.get('psName'));
    if(searchParams.get('dateFrom') != null) {
      setDateFrom(searchParams.get('dateFrom'));
    }else {
      setDateFrom(getDateTimeYMD(new Date().setMonth(new Date().getMonth() - 2)));
    }
    if(searchParams.get('dateTo') != null) {
      setDateTo(searchParams.get('dateTo'));
    } else {
      setDateTo(getDateTimeYMD(new Date().getTime()));
    }
    if(searchParams.get('sorting') != null) setSorting(searchParams.get('sorting'));
    if(searchParams.get('index') != null) setIndexBoard(searchParams.get('index'));

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
  }, [indexBoard, userID, positionID, sorting, dateFrom, dateTo]);
  
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
      if(positionID != 11) url = `/api/consult/list/${userID}/`;
      if(indexBoard != null) {
        url += `?index=${indexBoard}&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`;
      }
      const select = await fetch(url, {
        method: 'GET',
      });
      const content = await select.json();
      if(content.success) {
        setData(content.data);
        setTotalCount(content.totalCount);
        setLoader(false);
        
        let arr = [];
        const skipPage = Math.floor((indexBoard - 1) / 10) * 10;
        for (let i=0; i<10; i++) {
          if(i < Math.ceil(content.totalCount/10) - skipPage) {
            arr.push({number: i+skipPage+1})
          }
        }
        setBoardNumbers(arr);
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

  const getDateTimeYMD = s => {
    let d = new Date(s),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  const returnDigits = n => {
    if(Number(n) > 9) {
      return n;
    } else {
      return '0'+n;
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

  const clickMonthly = (e, n) => {
    const today = new Date();
    const correctedMonth = (today.getMonth()+n)%12;
    let correctedYear = today.getFullYear();
    if(correctedMonth > today.getMonth()) {
      correctedYear -= 1;
    }
    setDateFrom(correctedYear+'-'+returnDigits(correctedMonth+1)+'-01');
    setDateTo(correctedYear+'-'+returnDigits(correctedMonth+1)+'-'+returnDigits(new Date(correctedYear,correctedMonth+1, 0)).getDate());
  }

  return (
    <>
      <div className={'B00'}></div>
      <div className={'B01'}></div>
      <main>
        <div className={styles.C00}>
          <ManagerInfoTicker/>
          <HeadlineTicker/>
          <TopMenuTicker indexOfNav={{
            level: 'consult',
          }}/>
        </div>
        <div className={styles.C01}>
          <div className={styles.C02} ref={targetRef}>
            <div className={styles.C04}>
              <div className={'C01'}>
                <p className={'T00'}>고객번호:</p>
                <input className={"I00"} placeholder="예: 1A2B3C4D5" spellCheck="false" id="psEntry" name="psEntry" maxLength="9" onChange={e => {
                  setPsEntry(e.target.value);
                }}></input>
              </div>
              <div className={'C01'}>
                <p className={'T00'}>고객이름:</p>
                <input className={"I00"} placeholder="띄어쓰기 금지" spellCheck="false" id="psName" name="psName" maxLength="12" onChange={e => {
                  setPsName(e.target.value);
                }}></input>
              </div>
              <div className={'C01'}>
                <p className={'T00'}>월별조회:</p>
                <div className={'C00'}>
                  <p className={"T01"} onClick={e => clickMonthly(e, 9)}>{returnDigits((new Date().getMonth()+9)%12+1)}월</p>
                  <p className={"T01"} onClick={e => clickMonthly(e, 10)}>{returnDigits((new Date().getMonth()+10)%12+1)}월</p>
                  <p className={"T01"} onClick={e => clickMonthly(e, 11)}>{returnDigits((new Date().getMonth()+11)%12+1)}월</p>
                  <p className={"T01"} onClick={e => {
                    const today = new Date();
                    setDateFrom(today.getFullYear()+'-'+returnDigits(today.getMonth()+1)+'-01');
                    setDateTo(today.getFullYear()+'-'+returnDigits(today.getMonth()+1)+'-'+returnDigits(new Date(today.getFullYear(),today.getMonth()+1, 0)).getDate());
                  }}>이번 달</p>
                </div>
              </div>
              <div className={'C01'}>
                <p className={'T00'}>일별조회:</p>
                  <div className={"T03 isPrev"} onClick={e => {
                    const targetDay = new Date(dateTo);
                    const correctedDay = new Date(targetDay.getTime()-1000*60*60*24);
                    setDateFrom(getDateTimeYMD(correctedDay));
                    setDateTo(getDateTimeYMD(correctedDay));
                  }}>이전 일
                    <div className={'T04 styleSheet'}></div>
                  </div>
                  <div className={"T03 isToday"} onClick={e => {
                    const today = new Date();
                    setDateFrom(getDateTimeYMD(today));
                    setDateTo(getDateTimeYMD(today));
                  }}>오늘</div>
                  <div className={"T03 isNext"} onClick={e => {
                    const targetDay = new Date(dateTo);
                    const correctedDay = new Date(targetDay.getTime()+1000*60*60*24);
                    setDateFrom(getDateTimeYMD(correctedDay));
                    setDateTo(getDateTimeYMD(correctedDay));
                  }}>다음 일
                    <div className={'T04 styleSheet'}></div>
                  </div>
              </div>
              <div className={'C01'}>
                <p className={'T00'}>날짜선택:</p>
                <input className={"I01"} type="date" id="datepickerFrom" name="datepickerFrom" value={dateFrom ? getDateTimeYMD(dateFrom) : ''} onChange={e => {
                  setDateFrom(e.target.value);
                }}></input>
                ~
                <input className={"I01"} type="date" id="datepickerTo" name="datepickerTo" value={dateTo ? getDateTimeYMD(dateTo) : ''} onChange={e => {
                  setDateTo(e.target.value);
                }}></input>
                <p className={'T02'} onClick={e => {
                  router.push(`/consult/?index=1&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  boostListData();
                }}>검색하기</p>
              </div>
              <div className={'C01'}>
                <p className={'T00'}>정렬:</p>
                <div className={'C06'}>
                  <p className={`T08 ${sorting == 0 ? 'isSelected' : null}`} onClick={e => {
                    setSorting(0);
                  }}>전체보기</p>
                  <p className={`T08 ${sorting == 1 ? 'isSelected' : null}`} onClick={e => {
                    setSorting(1);
                  }}>편집대기</p>
                  <p className={`T08 ${sorting == 2 ? 'isSelected' : null}`} onClick={e => {
                    setSorting(2);
                  }}>미열람</p>
                </div>
              </div>
            </div>
            <div className={styles.C05}>
              <div className={'C02 isOpacity isMini isUnderline isShort'}>
                <p className={'T05 P20'}>고객번호</p>
                <p className={'T05 P20'}>고객이름</p>
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
              <div className={'C04'}>
                <p className={'T06 styleSheet isFirst'} onClick={e => {
                  router.push(`/consult/?index=1&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  setIndexBoard(1);
                }}></p>
                <p className={'T06 styleSheet isPrev'} onClick={e => {
                  if(indexBoard > 10) {
                    router.push(`/consult/?index=${Math.floor((indexBoard - 1) / 10)*10}&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                    setIndexBoard(Math.floor((indexBoard - 1) / 10)*10);
                  } else {
                    router.push(`/consult/?index=1&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                    setIndexBoard(1);
                  }
                }}></p>
                <div className={'C05'}>
                  {boardNumbers.map((item, index) => {
                    return (<p key={index} className={`T06 isPager ${(indexBoard == item.number)? `isSelected`:null}`} onClick={e => {
                      router.push(`/consult/?index=${item.number}&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                      setIndexBoard(item.number);
                    }}>{item.number}</p>)
                  })}
                </div>
                {Math.ceil(indexBoard / 10) != Math.ceil(totalCount / 100) ? <><p className={'T06 styleSheet isNext'} onClick={e => {
                  router.push(`/consult/?index=${Math.ceil(indexBoard / 10)*10 + 1}&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  setIndexBoard(Math.ceil(indexBoard / 10)*10 + 1);
                }}></p><p className={'T06 styleSheet isEnd'} onClick={e => {
                  router.push(`/consult/?index=${Math.ceil(totalCount / 10)}&psEntry=${psEntry}&psName=${psName}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  setIndexBoard(Math.ceil(totalCount / 10));
                }}></p></> : null}
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
