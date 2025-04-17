"use client";
export const dynamic = 'force-dynamic';
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

export default function Consult() {
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
  const [isExistWavFile, setExistWavFile] = useState(true);
  const [existAnalysis, setExistAnalysis] = useState(0);

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
    if(is2xSpeed) {
      document.getElementById('audio-player').playbackRate = 1.3;
    }else {
      document.getElementById('audio-player').playbackRate = 1;
    }
  }, [is2xSpeed])

  useEffect(() => {
    updateDimensions();
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
    if(document.getElementById('audio-player').duration) {
      setRemainTime(new Date(Number(document.getElementById('audio-player').duration) * 1000).toISOString().slice(11, 19));
    }
    updateDimensions();
    handleScroll();
    handleResize();
    window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
  }, [isAudioLoad])

  useEffect(() => {
    if(dataArticleSegments.length > 0) setOpenedPopup(true);
  }, [dataArticleSegments])

  useEffect(() => {
    if(dataConsultInfo.START_TIME) {
      const date = dataConsultInfo.START_TIME.replace('-', '').replace('-', '').substring(0,8);
      setSourceURL(`https://365mcstt.synology.me:8086/stt_data/${date}/${dataConsultInfo.PSENTRY}/${dataConsultInfo.WAV_FILE_NAME}`);
    }
    if(dataConsultInfo.BRANCH_id) boostListRoom();
  }, [dataConsultInfo])

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
        setExistAnalysis(content.existAnalysis);
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

  const handleError = (err) => {
    setExistWavFile(false);
  }

  // useEffect(() => {
  //   const checkFileExists = async () => {
  //     try {
  //       const response = await fetch(sourceURL, { method: 'GET' });
  //       if (response.ok) {
          
  //       } else {
  //         setExistWavFile(false);
  //       }
  //     } catch (err) {
  //       setExistWavFile(false);
  //     }
  //   };
  //   checkFileExists();
  // console.log(sourceURL)
  // }, [sourceURL]);

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
              <p className={'T09'} onClick={e => router.back()}><span className={'styleSheet isBack'}></span>상담목록</p>
              <div className={styles.C07}>
                <div className={styles.C09}>
                  <p className={`${styles.T04} ${editMode ? null: styles.isSelected }`} onClick={e => {
                    setEditMode(false);
                    setSegmentMenuIndex(null);
                  }}>읽기모드</p>
                  <p className={`${styles.T04} ${editMode ? styles.isSelected : null}`} onClick={e => {
                    setEditMode(true);
                    setSegmentMenuIndex(null);
                  }}>편집모드</p>
                </div>
              </div>
              {existAnalysis > 0 ?<p className={'T09 isAI'} onClick={e => {router.push(`/consult/analysis/${id}`, {scroll: false});}}><span className={'styleSheet isAI'}></span>AI 분석</p>:<p className={styles.T20}>AI 분석 안됨</p>}
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
            <p className={styles.T15}>{getTimeOnly(dataConsultInfo.START_TIME, 0)} - 상담 시작 이벤트 발생</p>
              {dataSegments.length > 0 && defaultSpeaker && dataSegmentsOrigin.length > 0 && dataSegments.map((segment, index) => {
                return(
                  <div className={`${styles.CSegment}
                    ${((segment.ADMIN_id != null || segment.CLIENT_id != null) && defaultSpeaker != segment.ADMIN_id && defaultSpeaker != segment.CLIENT_id) || (segment.ADMIN_id == null && segment.CLIENT_id == null && defaultSpeaker != segment.SPEAKER) ? styles.isRight : ''}`} key={index}>
                    {editMode ? (<div className={`${styles.CSegmentInfo} ${
                      segment.ADMIN_id == dataSegmentsOrigin[index].ADMIN_id 
                    && segment.CLIENT_id == dataSegmentsOrigin[index].CLIENT_id ? '' : styles.isChanged}`} onClick={e => {
                      if(segment.ADMIN_id == null && segment.CLIENT_id == null) {
                        setNumberTicker(index);
                      }else {
                        if(numberTicker == null) {
                          if(segment.ADMIN_id == null) {
                            changeSegmentSpeecher(index, 'ADMIN');
                          } else if(segment.CLIENT_id == null) {
                            changeSegmentSpeecher(index, 'CLIENT');
                          }
                        }
                      }
                    }}>
                      <p className={`${styles.T03}`}>{segment.ADMIN_id == null ? segment.CLIENT_id == null ? '화자' : '고객' : '관리자' }: <span>{returnSpeecher(segment.ADMIN_id, segment.CLIENT_id, segment.NICK_NAME, segment.SPEAKER)}</span></p>
                      {numberTicker == index ? (<div className={styles.C16} ref={refTicker}>
                        <div className={styles.C18} onClick={e => {
                          changeSegmentSpeecher(index, 'NONE');
                        }}><p className={styles.T10}><span className={styles.isPosition}>-- 분류 초기화 --</span></p><div className={`${styles.isSelector} styleSheet ${
                          segment.ADMIN_id == null
                        && segment.CLIENT_id == null ? styles.isSelected : null}`}></div></div>
                        <div className={styles.C18} onClick={e => {
                          changeSegmentSpeecher(index, 'ADMIN');
                        }}><p className={styles.T10}><span className={styles.isPosition}>{dataConsultInfo.POSITION_NAME}:</span>{dataConsultInfo.ADMIN_NAME}</p><div className={`${styles.isSelector} styleSheet ${
                          segment.ADMIN_id != null ? styles.isSelected : null}`}></div></div>
                        <div className={styles.C18} onClick={e => {
                          changeSegmentSpeecher(index, 'CLIENT');
                        }}><p className={styles.T10}><span className={styles.isPosition}>고객:</span>{dataConsultInfo.PSNAME}</p><div className={`${styles.isSelector} styleSheet ${
                          segment.CLIENT_id != null ? styles.isSelected : null}`}></div></div>
                        {/* <div className={styles.C18}><p className={styles.T10}><span className={styles.isPosition}>외부인:</span>홍길동</p><div className={`${styles.isSelector} styleSheet`}></div></div> */}
                        {/* <div className={styles.C18}>
                          <input className={styles.I00} />
                          <p className={styles.T11}>추가</p>
                        </div> */}
                      </div>) : null}
                      <p className={`${styles.T02} ${segment.CONFIDENCE > .9 ? styles.P90 : segment.CONFIDENCE > .8 ? styles.P80 : segment.CONFIDENCE > .7 ? styles.P70 : segment.CONFIDENCE > .6 ? styles.P60 : null}`}><span>{(segment.CONFIDENCE*100).toFixed(1)}</span></p>
                    </div>) : (<p className={`${styles.T05} heightElement ${segment.START_TIME < currentTimeGage*1000 && segment.END_TIME > currentTimeGage*1000 ? styles.isHighlight : null}`} onDoubleClick={e => {
                      setSegmentMenuTop(e.pageY);
                      setSegmentMenuLeft(e.pageX);
                      setSegmentMenuIndex(index);
                      setShowSegmentMenu(true);
                    }}><span>{returnSpeecher(segment.ADMIN_id, segment.CLIENT_id, segment.NICK_NAME, segment.SPEAKER)}: </span>{segment.TEXT}</p>)}
                    {editMode ? (
                    <div className={`${styles.CEdit}
                      ${segment.START_TIME < currentTimeGage*1000 && segment.END_TIME > currentTimeGage*1000 ? styles.isHighlight : null}
                      ${segment.TEXT == dataSegmentsOrigin[index].TEXT ? '' : styles.isChanged}`} onDoubleClick={e => {
                        setSegmentMenuTop(e.pageY);
                        setSegmentMenuLeft(e.pageX);
                        setSegmentMenuIndex(index);
                        setShowSegmentMenu(true);
                      }}>
                      <textarea id={`textArea${index}`} className={'isResizable'} value={segment.TEXT} onChange={e => changeSegment(index, e)} />
                    </div>) : null}
                    {/* {editMode && segment.words && segment.words.map((word, index2) => {
                      return(
                        <div className={`${styles.CWord} ${data.segments[index].words[index2][2] == originData.segments[index].words[index2][2] ? '' : styles.isChanged}`} key={index2}>
                          <input type='text' size={word[2].length*1.8} value={word[2]} onChange={e => changeWord(index, index2, e.target.value)} />
                        </div>
                      )
                    })} */}
                  </div>
                );
              })}
              <p className={styles.T16}>{getTimeOnly(dataConsultInfo.END_TIME, 0)} - 상담 종료 이벤트 발생</p>
              <div className={styles.C17}>
                <div className={styles.C28}>
                  <div className={styles.C29}>
                    <p className={styles.T00}>시작 검사</p>
                    {dataConsultInfo.WRONG_FOOT ? <p className={styles.T14}>결함</p> : <p className={`${styles.T14} ${styles.isValid}`}>무결</p>}
                  </div>
                  <div className={styles.C29}>
                    <p className={styles.T00}>종료 검사</p>
                    {dataConsultInfo.WRONG_ENDING ? <p className={styles.T14}>결함</p> : <p className={`${styles.T14} ${styles.isValid}`}>무결</p>}
                  </div>
                  <div className={styles.C29}>
                    <p className={styles.T00}>시간 검사</p>
                    {dataConsultInfo.WRONG_LENGTH ? <p className={styles.T14}>결함</p> : <p className={`${styles.T14} ${styles.isValid}`}>무결</p>}
                  </div>
                </div>
                <div className={styles.C22} style={{display: isExistWavFile ? 'inline-block': 'none'}}>
                  <div className={`${styles.BPlay} styleSheet ${playPaused ? styles.isPaused : ''}`} onClick={e => {
                    const player = document.getElementById('audio-player');
                    setPlayPaused(player.paused);
                    if(player.paused) {
                      player.play();
                      setPlaying(true);
                    }else {
                      player.pause();
                      setPlaying(false);
                    }
                  }}></div>
                  <div className={`${styles.BStop} styleSheet`} onClick={e => {
                    const player = document.getElementById('audio-player');
                    player.currentTime = 0;
                    setRunTime(0);
                    player.pause();
                    setPlaying(false);
                    setPlayPaused(false);
                  }}></div>
                  <p className={styles.T11}>{currentTime}</p>
                  <div className={styles.C23} onClick={e => {
                    if(e.clientX - e.currentTarget.getBoundingClientRect().left >= 17
                    && e.clientX - e.currentTarget.getBoundingClientRect().left <= e.currentTarget.getBoundingClientRect().width - 17) {
                      setRunTime((e.clientX - e.currentTarget.getBoundingClientRect().left - 17) / (e.currentTarget.getBoundingClientRect().width - 34) * 100);
                      const player = document.getElementById('audio-player');
                      player.currentTime = (e.clientX - e.currentTarget.getBoundingClientRect().left - 17) / (e.currentTarget.getBoundingClientRect().width - 34) * Number(document.getElementById('audio-player').duration)
                    }
                  }}>
                    <div className={styles.C24}></div>
                    <div className={styles.C25} style={{width: `calc(${runTime}% - ${.34*runTime}px)`}}></div>
                  </div>
                  <p className={styles.T11}>{remainTime}</p>
                  <p className={`${styles.T13} ${is2xSpeed ? styles.isSelected : null}`} onClick={e => {
                    set2xSpeed(!is2xSpeed);
                  }}>x1.3</p>
                  <audio id='audio-player' src={sourceURL} type="audio/mpeg"
                  onError={handleError}
                  onTimeUpdate={e => {
                    setCurrentTimeGage(e.currentTarget.currentTime);
                    setCurrentTime(new Date(e.currentTarget.currentTime * 1000).toISOString().slice(11, 19));
                    if(currentTimeGage && remainTime && isPlaying) {
                      setRunTime(currentTimeGage / Number(document.getElementById('audio-player').duration) * 100);
                    }
                  }}
                  onCanPlay={e => {
                    setAudioLoad(true);
                  }} />
                </div>
                <p className={styles.T19} style={{display: isExistWavFile ? 'none': 'inline-block'}}>상담 음성 파일이 없습니다.</p>
                <p className={styles.T06} onClick={e => {
                  if(JSON.stringify(dataSegments) == JSON.stringify(dataSegmentsOrigin)) {
                    toast.success('내용 중에 변경된 게 없습니다.');
                  }else {
                    boostUpdate();
                  }
                }}>편집완료</p>
              </div>
              {isShowSegmentMenu ? <div className={styles.C27} ref={refSegmentMenu} style={{
                top: `${segmentMenuTop-200}px`,
                left: `${segmentMenuLeft-50}px`}}>
                <p className={styles.T12} onClick={e => {
                  const player = document.getElementById('audio-player');
                  player.currentTime = dataSegments[segmentMenuIndex].START_TIME / 1000;
                  setRunTime(dataSegments[segmentMenuIndex].START_TIME / 10 / player.duration);
                  player.pause();
                  setPlaying(false);
                  setPlayPaused(false);
                  setShowSegmentMenu(false);
                  setEditMode(true);
                  setCurrentTimeGage(dataSegments[segmentMenuIndex].START_TIME / 1000);
                }}>이 문단 편집하기</p>
                <p className={styles.T12} onClick={e => {
                  const player = document.getElementById('audio-player');
                  player.currentTime = dataSegments[segmentMenuIndex].START_TIME / 1000;
                  setRunTime(dataSegments[segmentMenuIndex].START_TIME / 10 / player.duration);
                  player.play();
                  setPlaying(true);
                  setPlayPaused(true);
                  setShowSegmentMenu(false);
                }}>이 문단부터 읽기</p>
              </div> : null}
            </div>
            <div className={styles.C15}>
              <div className={styles.C10}>
                <div style={{width: (dataArticles.length * 260 - 20) + 'px'}}>
                  {dataArticles.length > 0 && dataArticles.map((article, index) => {
                    return (
                      <div className={styles.C11} key={index} onClick={e => {
                        if(index != 0) {
                          boostGetArticle(dataArticles[index].ARTICLE_ID);
                        }
                      }}>
                        {index == dataArticles.length-1 
                        ? <p className={styles.T09}>{getDateTime(article.createdAt[0], 0)} 등록 <span className={styles.isRed}>원본 보기</span></p>
                        : index == 0 ? <p className={styles.T09}>{getDateTime(article.createdAt[0], 0)} 수정 <span className={styles.isGreen}>최종본 보기</span></p>
                        : <p className={styles.T09}>{getDateTime(article.createdAt[0], 0)} 수정 <span>수정본 보기</span></p>}
                        <p className={styles.T17}>{index == dataArticles.length-1 
                        ? `등록` : `수정`}: <span className={styles.isBranch}>{article.BRANCH_NAME}</span> {article.POSITION_NAME} <span style={{fontSize: '1.2em'}}>{article.ADMIN_NAME}</span></p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.C03} style={{height: dimensions.height+'px'}}>
            <div className={styles.C14}>
              <CounselorInfoTicker/>
            </div>
          </div>
        </div>
        {isOpenedPopup ? <div className={styles.popup}>
          <div className={styles.C20} onClick={e => {
            setOpenedPopup(false);
          }}></div>
          <div className={styles.C19}>
            <div className={styles.C21}>
              {dataArticleSegments.length > 0 && dataArticleSegments.map((segment, index) => {
                return (
                  <div key={index} className={`${styles.CSegment}`}><p className={styles.T05}><span>{returnSpeecher(segment.ADMIN_id, segment.CLIENT_id, segment.NICK_NAME, segment.SPEAKER)}: </span>{segment.TEXT}</p></div>
              )})}
            </div>
          </div>
        </div> : null}
        {floatingPlayer && isExistWavFile ?
          <div className={styles.C26}>
            <div className={`${styles.BPlay} styleSheet ${playPaused ? styles.isPaused : ''}`} onClick={e => {
              const player = document.getElementById('audio-player');
              setPlayPaused(player.paused);
              if(player.paused) {
                player.play();
                setPlaying(true);
              }else {
                player.pause();
                setPlaying(false);
              }
            }}></div>
            <div className={`${styles.BStop} styleSheet`} onClick={e => {
              const player = document.getElementById('audio-player');
              player.currentTime = 0;
              setRunTime(0);
              player.pause();
              setPlaying(false);
              setPlayPaused(false);
            }}></div>
            <p className={styles.T11}>{currentTime}</p>
            <div className={styles.C23} onClick={e => {
              if(e.clientX - e.currentTarget.getBoundingClientRect().left >= 17
              && e.clientX - e.currentTarget.getBoundingClientRect().left <= e.currentTarget.getBoundingClientRect().width - 17) {
                setRunTime((e.clientX - e.currentTarget.getBoundingClientRect().left - 17) / (e.currentTarget.getBoundingClientRect().width - 34) * 100);
                const player = document.getElementById('audio-player');
                player.currentTime = (e.clientX - e.currentTarget.getBoundingClientRect().left - 17) / (e.currentTarget.getBoundingClientRect().width - 34) * Number(document.getElementById('audio-player').duration)
              }
            }}>
              <div className={styles.C24}></div>
              <div className={styles.C25} style={{width: `calc(${runTime}% - ${.34*runTime}px)`}}></div>
            </div>
            <p className={styles.T11}>{remainTime}</p>
            <p className={`${styles.T13} ${is2xSpeed ? styles.isSelected : null}`} onClick={e => {
              set2xSpeed(!is2xSpeed);
            }}>x1.3</p>
            <a href={sourceURL} download={`${dataConsultInfo.PSENTRY}-${dataConsultInfo.START_TIME}`}>
             <button className={styles.T18}>다운로드</button>
           </a>
            <audio id='audio-player' src={sourceURL} type="audio/mpeg"
            onTimeUpdate={e => {
              setCurrentTimeGage(e.currentTarget.currentTime);
              setCurrentTime(new Date(e.currentTarget.currentTime * 1000).toISOString().slice(11, 19));
              if(currentTimeGage && remainTime && isPlaying) {
                setRunTime(currentTimeGage / Number(document.getElementById('audio-player').duration) * 100);
              }
            }}
            onCanPlay={e => {
              setAudioLoad(true);
            }} />
          </div> : null}
        {isLoader ? <div className={'loading'}>
          <div className={'loading-back'}></div>
          <Image className={'loading-img'} src='/img/loading.gif' width={400} height={300} alt='로딩' />
        </div> : null}
      </main>
    </>
  )
}
