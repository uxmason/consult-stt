import Image from 'next/image'
import styles from './CounselorInfoTicker.module.css'
import { useEffect, useState } from 'react';
import Cookies from "js-cookie"
import toast from 'react-hot-toast';

export default function CounselorInfoTicker() {
  const [isLoader, setLoader] = useState(false);
  const [dataStatus, setDataStatus] = useState(null);

  useEffect(() => {
    if(!isLoader) {
      boostGetStatus();
    }
  }, [])

  const numberWithCommas = x => {
    if(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }else {
      return 0;
    }
  };

  const nullNumberCheck = n => {
    if(n == null) {
      return 0;
    }else {
      return n;
    }
  }

  const infinityCheck = n => {
    if(isFinite(n)) {
      return n;
    }else {
      return 0;
    }
  }

  const plusMinusCheck = s => {
    if(Number(s) > 0) {
      return '+'+s;
    }else {
      return s;
    }
  }

  const boostGetStatus = async () => {
    if(Cookies.get("USER_id")) {
      const userID = Cookies.get("USER_id");
      try {
        setLoader(true);
        let url = `/api/user/${userID}/status/`;
        const select = await fetch(url, {
          method: 'GET',
        });
        const content = await select.json();
        if(content.success) {
          setDataStatus(content);
          setLoader(false);
        }else {
          setDataStatus(null);
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
      {dataStatus != null ?
      <>
      <div className={styles.C01}>
        <p className={styles.T00}>상담 현황</p>
        {/* <p className={styles.T01}>분석이 안된 상담<span className={`${styles.isCount}`}>{numberWithCommas(dataStatus.notAnalysis)}</span></p> */}
        <p className={styles.T01}>미열람 상담<span className={`${styles.isCount} ${styles.isNotRead}`}>{numberWithCommas(dataStatus.notRead)}</span></p>
        <p className={styles.T01}>편집 대기중인 상담<span className={`${styles.isCount} ${styles.isContinue}`}>{numberWithCommas(dataStatus.waitingEdit)}</span></p>
        <p className={styles.T01}>편집이 완료된 상담<span className={`${styles.isCount} ${styles.isComplete}`}>{numberWithCommas(dataStatus.completeEdit)}</span></p>
      </div>
      <div className={styles.C01}>
        <p className={styles.T05}>오늘 상담 <span className={styles.isDate}>{new Date().toISOString().substring(2,10)}</span></p>
        <p className={styles.T02}>{numberWithCommas(nullNumberCheck(dataStatus.todayCount))}<span className={styles.isUnit}>건</span></p>
        <p className={styles.T03}>오늘 상담 시간</p>
        <p className={`${styles.T04}`}>{nullNumberCheck(dataStatus.todayTime)}</p>
      </div>
      <div className={styles.C01}>
        <p className={styles.T05}>이번달 상담 <span className={styles.isDate}>{`${new Date().toISOString().substring(2,7)}-01 ~ .${new Date().toISOString().substring(8,10)}`}</span></p>
        <p className={styles.T02}>{numberWithCommas(dataStatus.thisMonthCount)}<span className={styles.isUnit}>건</span></p>
        <p className={styles.T03}>작년 동월 대비</p>
        <p className={`${styles.T04} ${nullNumberCheck(dataStatus.thisMonthCount) - nullNumberCheck(dataStatus.lastMonthCount) > 0 ? styles.isBlue : styles.isRed}`}>{plusMinusCheck(infinityCheck((nullNumberCheck(dataStatus.thisMonthCount) - nullNumberCheck(dataStatus.lastMonthCount)) / nullNumberCheck(dataStatus.lastMonthCount)*100).toFixed(2))}<span className={styles.isUnit}>{`% (${plusMinusCheck(nullNumberCheck(dataStatus.thisMonthCount) - nullNumberCheck(dataStatus.lastMonthCount))})`}</span></p>
      </div>
      <div className={styles.C01}>
        <p className={styles.T05}>올해 상담 <span className={styles.isDate}>{`${new Date().toISOString().substring(2,4)}-01-01 ~ .${new Date().toISOString().substring(5,10)}`}</span></p>
        <p className={styles.T02}>{numberWithCommas(dataStatus.thisYearCount)}<span className={styles.isUnit}>건</span></p>
        <p className={styles.T03}>작년 누계 대비</p>
        <p className={`${styles.T04} ${nullNumberCheck(dataStatus.thisYearCount) - nullNumberCheck(dataStatus.lastYearCount) > 0 ? styles.isBlue : styles.isRed}`}>{plusMinusCheck(infinityCheck((nullNumberCheck(dataStatus.thisYearCount) - nullNumberCheck(dataStatus.lastYearCount)) / nullNumberCheck(dataStatus.lastYearCount)*100).toFixed(2))}<span className={styles.isUnit}>{`% (${plusMinusCheck(nullNumberCheck(dataStatus.thisYearCount) - nullNumberCheck(dataStatus.lastYearCount))})`}</span></p>
      </div>
      <div className={styles.C01}>
        <p className={styles.T05}>상담 총합 <span className={styles.isDate}>{new Date().toISOString().substring(2,10)} 까지 누계</span></p>
        <p className={styles.T02}>{numberWithCommas(dataStatus.totalCount)}<span className={styles.isUnit}>건</span></p>
        <p className={styles.T03}>상담 시간 누계</p>
        <p className={`${styles.T04}`}>{numberWithCommas(Math.round(dataStatus.totalTime/60/60))}<span className={styles.isUnit}>시간</span></p>
      </div></>:null}
    </div>
  )
}
