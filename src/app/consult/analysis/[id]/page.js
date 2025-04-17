"use client";
import Image from 'next/image'
import styles from './page.module.css'
import ManagerInfoTicker from '../../../components/ManagerInfoTicker'
import HeadlineTicker from '../../../components/HeadlineTicker'
import CounselorInfoTicker from '../../../components/CounselorInfoTicker'
import Cookies from "js-cookie"
import jwt from "jsonwebtoken"
import Link from 'next/link'
import { createRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation';
import { toast } from "react-hot-toast";
import TopMenuTicker from '../../../components/TopMenuTicker';

export default function Consult(props) {
  const router = useRouter();
  const { id } = useParams();
  const targetRef = useRef();
  const refTicker = useRef(null);
  const refSegmentMenu = useRef(null);
  // const [refTextAreas, setRefTextAreas] = useState([]);
  const [isLoader, setLoader] = useState(false);
  const [dataConsultInfo, setDataConsultInfo] = useState([]);
  const [dataArticles, setDataArticles] = useState([]);
  const [dataArticleSegments, setDataArticleSegments] = useState([]);
  const [dataSegments, setDataSegments] = useState([]);
  const [dataSegmentsOrigin, setDataSegmentsOrigin] = useState([]);
  const [dataRooms, setDataRooms] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [numberTicker, setNumberTicker] = useState(null);
  const [isOpenedPopup, setOpenedPopup] = useState(false);
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [defaultSpeaker, setDefaultSpeaker] = useState();
  const [playPaused, setPlayPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [remainTime, setRemainTime] = useState("00:00:00");
  const [sourceURL, setSourceURL] = useState();
  const [isAudioLoad, setAudioLoad] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [currentTimeGage, setCurrentTimeGage] = useState();
  const [runTime, setRunTime] = useState();
  const [floatingPlayer, setFloatingPlayer] = useState(false);
  const [isShowSegmentMenu, setShowSegmentMenu] = useState(false);
  const [segmentMenuLeft, setSegmentMenuLeft] = useState(0);
  const [segmentMenuTop, setSegmentMenuTop] = useState(0);
  const [segmentMenuIndex, setSegmentMenuIndex] = useState(0);
  const [roomID, setRoomID] = useState(null);
  const [is2xSpeed, set2xSpeed] = useState(false);
  const [currentScrollHeightIndex, setCurrentScrollHeightIndex] = useState(null);
  const [userID, setUserID] = useState();
  const [abridgment, setAbridgment] = useState('');
  const [keywords, setKeywords] = useState([]);

  const handleKeyPress = e => {
    if(e.key == 'ArrowRight') {
      const player = document.getElementById('audio-player');
      player.currentTime += 10;
    }
    if(e.key == 'ArrowLeft') {
      const player = document.getElementById('audio-player');
      player.currentTime -= 10;
    }
  }

  const handleKeyPressRef = useRef(handleKeyPress);

  handleKeyPressRef.current = handleKeyPress;

  useEffect(() => {
    const handler = e => {
      handleKeyPressRef.current(e);
    }
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [])

  useEffect(() => {
    if(dataSegments[0]) {
      if(dataSegments[0].ADMIN_id) {
        setDefaultSpeaker(dataSegments[0].ADMIN_id);
      } else {
        if(dataSegments[0].CLIENT_id) {
          setDefaultSpeaker(dataSegments[0].CLIENT_id);
        }else {
          setDefaultSpeaker(dataSegments[0].SPEAKER);
        }
      }
    }
    if(Cookies.get("USER_id")) {
      setUserID(Cookies.get("USER_id"));
    }
  }, [dataSegments])

  useEffect(() => {
    if(currentTimeGage) {
      for(let i=0; i<dataSegments.length; i++) {
        if(currentTimeGage*1000 > dataSegments[i].START_TIME && currentTimeGage*1000 < dataSegments[i].END_TIME) {
          if(currentScrollHeightIndex != i) setCurrentScrollHeightIndex(i);
        }
      }
    }
  }, [currentTimeGage])

  useEffect(() => {
    if(currentScrollHeightIndex) {
      if(document.querySelectorAll('.heightElement').length > 0) {
        if(window.innerHeight < document.querySelectorAll('.heightElement')[currentScrollHeightIndex].getBoundingClientRect().y + 170) {
          let counting = 0;
          for(let i=0; i<=currentScrollHeightIndex; i++) {
            counting += document.querySelectorAll('.heightElement')[i].getBoundingClientRect().height;
          }
          window.scrollTo({ top: counting + 520 - window.innerHeight, behavior: 'smooth' });
        }
      }
    }
  }, [currentScrollHeightIndex])

  useEffect(() => {
    const handleOutSideClick = e => {
      if (!refSegmentMenu.current?.contains(e.target)) {
        setShowSegmentMenu(false);
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {window.removeEventListener("mousedown", handleOutSideClick);}
  }, [refSegmentMenu]);

  useEffect(() => {
    if (roomID) boostUpdateRoom();
  }, [roomID])

  useEffect(() => {
    if(dataArticleSegments.length > 0) setOpenedPopup(true);
  }, [dataArticleSegments])

  useEffect(() => {
    if(dataConsultInfo.BRANCH_id) boostListRoom();
  }, [dataConsultInfo])

  useEffect(() => {
    updateDimensions();
  }, [keywords])

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
      boostGetData();
    };

    validateToken();
  }, [router]);

  useEffect(() => {
    const handleOutSideClick = e => {
      if (!refTicker.current?.contains(e.target)) {
        setNumberTicker(null);
      }
    };
    window.addEventListener("mousedown", handleOutSideClick);
    return () => {window.removeEventListener("mousedown", handleOutSideClick);}
  }, [refTicker]);

  const handleResize = () => {
    const elements = document.querySelectorAll('.isResizable');
    elements.forEach((element) => {
      element.style.height = "5px";
      element.style.height = `${element.scrollHeight-2}px`;
    });
  }
  const handleScroll = () => {
    if(document.body.getBoundingClientRect().height - window.innerHeight - window.pageYOffset > 240) {
      setFloatingPlayer(true);
    }else {
      setFloatingPlayer(false);
    }
  }


  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    updateDimensions();
    handleResize();
    if(editMode && segmentMenuIndex) {
      document.getElementById('textArea'+segmentMenuIndex).focus();
    }
  }, [editMode]);

  useLayoutEffect(() => {
    if(targetRef.current) {
      setDimensions({
        width: targetRef.current.offsetWidth,
        height: targetRef.current.offsetHeight
      });
    }
  }, []);

  const getAge = s => {
    if(s) {
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
    }else {
      return '';
    }
  }

  const getSex = s => {
    if(s) {
      const index = Number(s.substring(6,7));
      if(index == 1 || index == 3 || index == 5 || index == 7) {
        return '남';
      } else {
        return '여';
      }
    } else {
      return '';
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
  const getTimeOnly = (s, correction) => {
    if(s) {
      let d = new Date(s);
      d.setHours(d.getHours() + correction);
      return d.toISOString().replace('T', ' ').substring(11, 16);
    } else {
      return '';
    }
  }

  const boostGetData = async () => {
    try {
      setLoader(true);
      let url = `/api/consult/${id}`;
      const insert = await fetch(url, {
        method: 'GET',
      });
      const content = await insert.json();
      if(content.success) {
        setDataConsultInfo(content.info);
        setDataArticles(content.articles);
        setDataSegments(content.segments);
        setDataSegmentsOrigin(JSON.parse(JSON.stringify(content.segments)));
        setLoader(false);
        boostGetAnalysis();
      }else {
        setLoader(false);
        toast.error(content.message);
      }
    } catch (error) {
      setLoader(false);
      toast.error(error.message);
    }
  };

  const boostGetAnalysis = async () => {
    try {
      setLoader(true);
      let url = `/api/analysis/${id}`;
      const insert = await fetch(url, {
        method: 'GET',
      });
      const content = await insert.json();
      if(content.success) {
        setAbridgment(content.abridgment);
        setKeywords(content.keywords);
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

  const boostUpdate = async () => {
    if(!isLoader) {
      try {
        setLoader(true);
        let url = `/api/article/`;
        const insert = await fetch(url, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            editorID: userID,
            consultID: id,
            segments: dataSegments
          }),
        });
        const content = await insert.json();
        if(content.success) {
          setLoader(false);
          // router.back();
          window.location.reload();
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

  const boostGetArticle = async (ARTICLE_id) => {
    try {
      setLoader(true);
      let url = `/api/article/${ARTICLE_id}`;
      const insert = await fetch(url, {
        method: 'GET',
      });
      const content = await insert.json();
      if(content.success) {
        setDataArticleSegments(content.segments);
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

  const boostListRoom = async () => {
    try {
      setLoader(true);
      let url = `/api/setting/rooms/branch/${dataConsultInfo.BRANCH_id[0]}`;
      const select = await fetch(url, {
        method: 'GET',
      });
      const content = await select.json();
      if(content.success) {
        setLoader(false);
        setDataRooms(content.data);
      }else {
        setLoader(false);
        console.log(content.message);
      }
    } catch (error) {
      setLoader(false);
      console.log(error.message);
    }
  };

  const boostUpdateRoom = async () => {
    if(!isLoader) {
      try {
        setLoader(true);
        let url = `/api/consult/${id}/room/`;
        const insert = await fetch(url, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomID: roomID,
          }),
        });
        const content = await insert.json();
        if(content.success) {
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
  }

  const updateDimensions = () => {
    if(targetRef.current) {
      setDimensions({
          width: targetRef.current.offsetWidth,
          height: targetRef.current.offsetHeight
      });
    }
  };

  const changeWord = (parent, child, value) => {
    data.segments[parent].words[child][2] = value;
    setData({
      ...data,
      data
    })
  };

  const changeSegment = (index, e) => {
    dataSegments[index].TEXT = e.target.value;
    setDataSegments([
      ...dataSegments
    ])
    e.target.style.height = "5px";
    e.target.style.height = (e.target.scrollHeight) + "px";
  };

  const changeSegmentSpeecher = (index, kind) => {
    if(kind == "NONE") {
      dataSegments[index].ADMIN_id = null;
      dataSegments[index].CLIENT_id = null;
    }
    if(kind == "ADMIN") {
      dataSegments[index].ADMIN_id = dataConsultInfo.ADMIN_id;
      dataSegments.map(segment => {
        if(segment.ADMIN_id == null && segment.CLIENT_id == null && segment.SPEAKER == dataSegments[index].SPEAKER) {
          segment.ADMIN_id = dataConsultInfo.ADMIN_id;
          if(segment.CLIENT_id != null) segment.CLIENT_id = null;
        }
      })
      dataSegments[index].CLIENT_id = null;
    }
    if(kind == "CLIENT") {
      dataSegments[index].CLIENT_id = dataConsultInfo.CLIENT_id;
      dataSegments.map(segment => {
        if(segment.ADMIN_id == null && segment.CLIENT_id == null && segment.SPEAKER == dataSegments[index].SPEAKER) {
          if(segment.ADMIN_id != null) segment.ADMIN_id = null;
          segment.CLIENT_id = dataConsultInfo.CLIENT_id;
        }
      })
      dataSegments[index].ADMIN_id = null;
    }
    setDataSegments([
      ...dataSegments
    ])
  }

  const returnSpeecher = (a, c, g, s) => {
    if(a == dataConsultInfo.ADMIN_id) return dataConsultInfo.ADMIN_NAME;
    if(c == dataConsultInfo.CLIENT_id) return dataConsultInfo.PSNAME;
    if(g != null) return g;
    return s;
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
              <p className={'T09'} onClick={e => router.back()}><span className={'styleSheet isBack'}></span>뒤로가기</p>
              <div className={styles.C08}>
                <div className={styles.C06}>
                  <p className={styles.T00}>고객</p>
                  <p className={`T05 isShort isFloat`}>{dataConsultInfo.PSNAME}<span className={`isSex ${getSex(dataConsultInfo.LICENSE) == '여' ? 'isRed' : 'isBlue'}`}>{getSex(dataConsultInfo.LICENSE)}</span>{getAge(dataConsultInfo.LICENSE)}<span className={'isAgeUnit'}>세</span></p>
                </div>
                <div className={styles.C06}>
                  <p className={styles.T00}>상담기수</p>
                  {dataConsultInfo.PERIOD ? <p className={styles.T01}>{`${dataConsultInfo.PERIOD}기 (${dataConsultInfo.PERIOD == 0 || dataConsultInfo.PERIOD == 1 ? '신환': '재환'})`}</p>:null}
                </div>
                <div className={styles.C06}>
                  <p className={styles.T00}>상담사</p>
                  <p className={`T05 isShort isFloat`}>{dataConsultInfo.ADMIN_NAME}<span className={styles.isPosition}>{dataConsultInfo.POSITION_NAME}</span></p>
                </div>
                <div className={styles.C06}>
                  <p className={styles.T00}>상담시작</p>
                  <p className={styles.T01}>{getDateTime(dataConsultInfo.START_TIME, 0)}</p>
                </div>
                <div className={styles.C06}>
                  <p className={styles.T00}>상담종료</p>
                  <p className={styles.T01}>{getDateTime(dataConsultInfo.END_TIME, 0)}</p>
                </div>
                <div className={styles.C06}>
                  <p className={styles.T00}>상담실</p>
                  <p className={styles.T01}>{dataConsultInfo.ROOM_NAME}</p>
                  {dataRooms.length > 0 ? <select className={styles.S00} defaultValue={dataConsultInfo.ROOM_id} onChange={e => {
                    setRoomID(e.target.value);
                  }}>
                    <option key="0" value="0">선택해주세요.</option>
                    {dataRooms.length > 0 && dataRooms.map((item, index) => {
                      return <option key={index+1} value={item._id}>{item.ROOM_NAME}</option>
                    })}
                  </select> : null}
                </div>
              </div>
            </div>
            <div className={styles.C05}>
              <p className={styles.T02}>상담 내용 요약</p>
              <p className={styles.T03}>{`" ${abridgment} "`}</p>
            </div>
            <div className={styles.C15}>
              <p className={styles.T02}>키워드 분석</p>
              <div className={styles.C07}>
                {keywords.length > 0 && keywords.map((item, index) => {
                  return <div className={styles.C09} key={index}><p className={styles.T04}>{item.COUNT}</p><p className={styles.T06}>{item.WORD}</p></div>
                })}
              </div>
            </div>
          </div>
          <div className={styles.C03} style={{height: dimensions.height+'px'}}>
            <div className={styles.C14}>
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
