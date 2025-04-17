"use client"; 
import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from "react-hot-toast"

export default function Home() {
    const fileRef = useRef();
    const router = useRouter();
    const [fileContent, setFileContent] = useState(null);
    const [isLoader, setLoader] = useState(false);
    const [data, setData] = useState([]);
    const [segmentIDs, setSegmentIDs] = useState(null);
    const [consultID, setConsultID] = useState(null);
    const [segmentCount, setSegmentCount] = useState(0);
    const [segmentIndex, setSegmentIndex] = useState(0);

    const readFile = event => {
        const fileReader = new FileReader();
        const { files } = event.target;

        fileReader.readAsText(files[0], "UTF-8");
        fileReader.onload = e => {
            const content = e.target.result;
            setFileContent(JSON.parse(content));
        };
    };

    useEffect(() => {
        if(consultID && segmentIDs) {
            if(segmentIndex < segmentCount) {
                boostInsertWords();
            }else {
                setFileContent(null);
            }
        }
    }, [segmentIDs, consultID, segmentIndex, segmentCount])

    const boostInsertWords = async () => {
        try {
            setLoader(true);
            let url = `/api/word/`;
            console.log(consultID, segmentIDs[segmentIndex]._id, fileContent.clovaData.segments[segmentIndex].words)
            const insert = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    consultID: consultID,
                    segmentID: segmentIDs[segmentIndex]._id,
                    words: fileContent.clovaData.segments[segmentIndex].words
                }),
            });
            const content = await insert.json();
            if(content.success) {
                setLoader(false);
                setSegmentIndex(segmentIndex+1);
            }else {
                setLoader(false);
                toast.error(content.message);
            }
        } catch (error) {
            setLoader(false);
            toast.error(error.message);
        } 
    }
    
    const boostInsertArticle = async () => {
        if(!isLoader && fileContent) {
            console.log(fileContent)
            try {
                setLoader(true);
                let url = `/api/article/`;
                const insert = await fetch(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fileContent),
                });
                const content = await insert.json();
                if(content.success) {
                    setLoader(false);
                    setConsultID(content.consultID);
                    setSegmentIDs(content.segmentIDs);
                    setSegmentIndex(0);
                    setSegmentCount(content.segmentIDs.length);
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
                    <p className={styles.T00}>JSON 강제 업로드</p>
                    <input className={styles.I00} ref={fileRef} type="file" onChange={readFile} />
                    <p className={styles.T04} onClick={e => {
                        boostInsertArticle();
                    }}>전송</p>
                </div>
            </main>
        </>
    )
}
