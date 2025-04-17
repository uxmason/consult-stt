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

export default function Words() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <Content />
    </Suspense>
  )
}

function Content() {
  const indexCountLimit = 50;
  const router = useRouter();
  const searchParams = useSearchParams()
  const targetRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [isLoader, setLoader] = useState(false);
  const [indexBoard, setIndexBoard] = useState(1);
  const [data, setData] = useState([]);
  const [dataBranches, setDataBranches] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [boardNumbers, setBoardNumbers] = useState([]);
  const [userID, setUserID] = useState();
  const [positionID, setPositionID] = useState();

  const [keyword, setKeyword] = useState('');
  const [branchID, setBranchID] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sorting, setSorting] = useState(1);

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
    if(searchParams.get('keyword') != null) setKeyword(searchParams.get('keyword'));
    if(searchParams.get('branchID') != null) setBranchID(searchParams.get('branchID'));
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
    boostListDataBranches();
  }, [data]);

  useEffect(() => {
    setIndexBoard(1);
  }, [sorting]);

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
      let url = `/api/word/`;
      if(positionID != 11) url = `/api/word/list/${userID}/`;
      if(indexBoard != null) {
        url += `?index=${indexBoard}&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}&limitCount=${indexCountLimit}`;
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
        const skipPage = Math.floor((indexBoard - 1) / indexCountLimit) * indexCountLimit;
        for (let i=0; i<10; i++) {
          if(i < Math.ceil(content.totalCount/indexCountLimit) - skipPage) {
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
            level: 'words',
          }}/>
        </div>
        <div className={styles.C01}>
          <div className={styles.C02} ref={targetRef}>
            <div className={styles.C04}>
              <div className={'C01'}>
                <p className={'T00'}>키워드:</p>
                <input className={"I00"} defaultValue={keyword} placeholder="띄워쓰기 금지" spellCheck="false" id="keyword" name="keyword" maxLength="12" onChange={e => {
                  setKeyword(e.target.value);
                }}></input>
                <p className={'T00'}>지점:</p>
                <select defaultValue={branchID} className={styles.S00} onChange={e => {
                  setBranchID(e.target.value);
                }}>
                  <option value={0}>선택해주세요.</option>
                  {dataBranches && dataBranches.map((item, index) => {
                    return(<option key={index} value={item._id}>{item.BRANCH_NAME}</option>)
                  })}
                </select>
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
                  router.push(`/words/?index=1&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  if(indexBoard != 1) {
                    setIndexBoard(1);
                  } else {
                    boostListData();
                  }
                }}>검색하기</p>
              </div>
              <div className={'C01'}>
                <p className={'T00'}>정렬:</p>
                <div className={'C06'}>
                  <p className={`T08 ${sorting == 0 ? 'isSelected' : null}`} onClick={e => {
                    setSorting(0);
                  }}>사전 반영</p>
                  <p className={`T08 ${sorting == 1 ? 'isSelected' : null}`} onClick={e => {
                    setSorting(1);
                  }}>사전 미반영</p>
                </div>
              </div>
            </div>
            <div className={styles.C05}>
              <div className={'C02 isOpacity isMini isUnderline isShort'}>
                <p className={'T05 P15'}>순위</p>
                <p className={'T05 P25'}>단어</p>
                <p className={'T05 P15'}>누적수</p>
                <p className={'T05 P20'}>주요 키워드</p>
                <p className={'T05 P25'}>순위변화</p>
              </div>
              <div className={'C05'}>
              {data && data.map((item, index) => {
                return <div className={'C02'} key={index}>
                  <p className={'T05 P15'}>{(indexBoard-1)*indexCountLimit+index+1}</p>
                  <p className={'T05 P25'}>{item.WORD}</p>
                  <p className={'T05 P15'}>{item.CNT}</p>
                  <p className={'T05 P20'}>{item.ISDIC == 1 ? <span className={'isStatus isComplete'}>등록됨</span>:<>ㅤ</>}</p>
                  <p className={'T05 P25'}>ㅤ</p>
                </div>})
                // <Link key={index} href={`/word/detail/${item.CONSULT_id}`} scroll={false}>
                // </Link>
              }
              </div>
              <div className={'C04'}>
                <p className={'T06 styleSheet isFirst'} onClick={e => {
                  router.push(`/words/?index=1&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  setIndexBoard(1);
                }}></p>
                <p className={'T06 styleSheet isPrev'} onClick={e => {
                  if(indexBoard > indexCountLimit) {
                    router.push(`/words/?index=${Math.floor((indexBoard - 1) / indexCountLimit)*indexCountLimit}&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                    setIndexBoard(Math.floor((indexBoard - 1) / indexCountLimit)*indexCountLimit);
                  } else {
                    router.push(`/words/?index=1&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                    setIndexBoard(1);
                  }
                }}></p>
                <div className={'C05'}>
                  {boardNumbers.map((item, index) => {
                    return (<p key={index} className={`T06 isPager ${(indexBoard == item.number)? `isSelected`:null}`} onClick={e => {
                      router.push(`/words/?index=${item.number}&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                      setIndexBoard(item.number);
                    }}>{item.number}</p>)
                  })}
                </div>
                {Math.ceil(indexBoard / indexCountLimit) != Math.ceil(totalCount / 100) ? <><p className={'T06 styleSheet isNext'} onClick={e => {
                  router.push(`/words/?index=${Math.ceil(indexBoard / indexCountLimit)*indexCountLimit + 1}&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  setIndexBoard(Math.ceil(indexBoard / indexCountLimit)*indexCountLimit + 1);
                }}></p><p className={'T06 styleSheet isEnd'} onClick={e => {
                  router.push(`/words/?index=${Math.ceil(totalCount / indexCountLimit)}&keyword=${keyword}&branchID=${branchID}&dateFrom=${dateFrom}&dateTo=${dateTo}&sorting=${sorting}`, {scroll: false});
                  setIndexBoard(Math.ceil(totalCount / indexCountLimit));
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
