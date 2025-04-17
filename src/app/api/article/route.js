import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import jwt from "jsonwebtoken";
import ExecuteQuery from '../../../utils/msSql';

export async function POST(request) {
  const query = await request.json();
  try {
    let adminID;
    const data = await ExecuteQuery(`SELECT TOP 1 * FROM CUSTOM_ADMINS WHERE USER_NUMBER = '${query.userNumber}'`);
    if(data && data.length > 0) {
      adminID = data[0].ADMIN_id;
    } else {
      const response = await fetch(`${process.env.ORACLE_URL}/SYS080T/USER_NUMBER/${query.userNumber}`);
      const SYS080T = await response.json();
      const data6 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_BRANCHES WHERE BRANCH_INFO_CODE = '${query.client.ACMANAG}'`);
      if(data6 && data6.length > 0) {
        const branchID = data6[0]._id;
        const data7 = await ExecuteQuery(`INSERT INTO CORE_ADMINS (ADMIN_ID, PASSWORD, ADMIN_NAME, BRANCH_id, RANK_id, POSITION_id, createdAt)
        VALUES ('${SYS080T[0].USER_ID}', HASHBYTES('MD5', '${SYS080T[0].MAIN_PASS}'), '${SYS080T[0].USER_NAME}', ${branchID}, 3, 8, SYSDATETIME())`);
        const data70 = await ExecuteQuery(`SELECT IDENT_CURRENT('CORE_ADMINS') AS LAST_ID`);
        adminID = data70[0].LAST_ID;
        const data8 = await ExecuteQuery(`INSERT INTO CUSTOM_ADMINS (ADMIN_id, USER_NUMBER, createdAt)
        VALUES (${adminID}, '${SYS080T[0].USER_NUMBER}', SYSDATETIME())`);
      } else {
        return NextResponse.json({ success:false, message:'등록되지 않은 지점코드라 관리자 가입을 할 수 없습니다.' }, { status:200 });
      }
    }
    const data0 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_BRANCHES WHERE BRANCH_INFO_CODE = '${query.client.ACMANAG}'`);
    if(data0 && data0.length > 0) {
      const branchID = data0[0]._id;
      const data1 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_CLIENTS WHERE PSENTRY = '${query.client.PSENTRY}'`);
      let clientID;
      if(data1 && data1.length > 0) {
        clientID = data1[0]._id;
      } else {
        const data2 = await ExecuteQuery(`INSERT INTO CORE_CLIENTS (PSENTRY, PSNAME, BRANCH_id, LICENSE, createdAt)
        VALUES ('${query.client.PSENTRY}', '${query.client.PSNAME}', ${branchID}, '${query.client.LICENSE}', SYSDATETIME())`);
        const data20 = await ExecuteQuery(`SELECT IDENT_CURRENT('CORE_CLIENTS') AS LAST_ID`);
        clientID = data20[0].LAST_ID;
      }
      let roomID = null;
      if(query.unitNumber) {
        const data9 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_CONSULT_ROOMS WHERE UNIT_NUMBER = '${query.unitNumber}' AND BRANCH_id = ${branchID}`);
        if(data9 && data9.length > 0) {
          roomID = data9[0]._id;
        } else {
          const data10 = await ExecuteQuery(`INSERT INTO CORE_CONSULT_ROOMS (UNIT_NUMBER, ROOM_NAME, BRANCH_id, createdAt)
          VALUES ('${query.unitNumber}', '${query.unitNumber}호', ${branchID}, SYSDATETIME())`);
          const data100 = await ExecuteQuery(`SELECT IDENT_CURRENT('CORE_CONSULT_ROOMS') AS LAST_ID`);
          roomID = data100[0].LAST_ID;
        }
      }
      if(roomID) {
        const data3 = await ExecuteQuery(`INSERT INTO CORE_CONSULTS (START_TIME, END_TIME, ADMIN_id, BRANCH_id, CLIENT_id, WAV_FILE_NAME, ROOM_id, PERIOD, createdAt)
        VALUES (CONVERT(DATETIME, '${query.startTime}'), CONVERT(DATETIME, '${query.endTime}'), ${adminID}, ${branchID}, ${clientID}, '${query.wavFileName}', ${roomID}, ${query.period}, SYSDATETIME())`);
      }else {
        const data3 = await ExecuteQuery(`INSERT INTO CORE_CONSULTS (START_TIME, END_TIME, ADMIN_id, BRANCH_id, CLIENT_id, WAV_FILE_NAME, PERIOD, createdAt)
        VALUES (CONVERT(DATETIME, '${query.startTime}'), CONVERT(DATETIME, '${query.endTime}'), ${adminID}, ${branchID}, ${clientID}, '${query.wavFileName}', ${query.period}, SYSDATETIME())`);
      }
      const data30 = await ExecuteQuery(`SELECT IDENT_CURRENT('CORE_CONSULTS') AS LAST_ID`);
      const consultID = data30[0].LAST_ID;
      const data4 = await ExecuteQuery(`INSERT INTO CORE_CONSULT_ARTICLES (CONSULT_id, EDITOR_id, createdAt) VALUES (${consultID}, ${adminID}, SYSDATETIME())`);
      const data40 = await ExecuteQuery(`SELECT IDENT_CURRENT('CORE_CONSULT_ARTICLES') AS LAST_ID`);
      const articleID = data40[0].LAST_ID;
      let insertString = '';
      if(query.clovaData.segments.length > 0) {
        query.clovaData.segments.map(async (segment, index) => {
          if(index == 0) {
            insertString += `(${articleID}, ${segment.start}, ${segment.end}, '${segment.text}', ${segment.confidence}, '${segment.speaker.name}', SYSDATETIME())`;
          } else {
            insertString += `, (${articleID}, ${segment.start}, ${segment.end}, '${segment.text}', ${segment.confidence}, '${segment.speaker.name}', SYSDATETIME())`;
          }
        })
        const data5 = await ExecuteQuery(`INSERT INTO CORE_CONSULT_SEGMENTS (ARTICLE_id, START_TIME, END_TIME, TEXT, CONFIDENCE, SPEAKER, createdAt) 
        VALUES ${insertString}`);
      }

      const data11 = await ExecuteQuery(`SELECT _id FROM CORE_CONSULT_SEGMENTS WHERE ARTICLE_id = ${articleID}`);

      const data12 = await ExecuteQuery(`INSERT INTO CUSTOM_CONSULT_VALIDATIONS (WRONG_FOOT, WRONG_ENDING, WRONG_LENGTH, CONSULT_id, createdAt) 
      VALUES (${query.isWrongFoot}, ${query.isWrongEnding}, ${query.isWrongLength}, ${consultID}, SYSDATETIME())`);

      const data13 = await ExecuteQuery(`INSERT INTO CUSTOM_INSERT_ORACLE_ROOM (CONSULT_id, ORACLE_ROOM_NAME, createdAt) 
      VALUES (${consultID}, '${query.oracleRoomName}', SYSDATETIME())`);

      const data14 = await ExecuteQuery(`INSERT INTO LOG_INSERT_CONSULT (지점번호, PEO010T_상담실_번호, ADM014T_상담실_이름, 병원측_사원번호, 상담시작시간, 상담종료시간, 회원이름, 회원번호, 확인_잘못된상담시작, 확인_잘못된상담종료, 확인_너무긴상담시간, CONSULT_id, createdAt)
      VALUES('${query.client.ACMANAG}', '${query.unitNumber}', '${query.oracleRoomName}', '${query.userNumber}', 
      CONVERT(DATETIME, '${query.startTime}'), CONVERT(DATETIME, '${query.endTime}'), '${query.client.PSNAME}', '${query.client.PSENTRY}', 
      ${query.isWrongFoot}, ${query.isWrongEnding}, ${query.isWrongLength}, ${consultID}, SYSDATETIME())`);
      
      return NextResponse.json({ success:true, message:'등록완료', test:`INSERT INTO LOG_INSERT_CONSULT (지점번호, PEO010T_상담실_번호, ADM014T_상담실_이름, 병원측_사원번호, 상담시작시간, 상담종료시간, 회원이름, 회원번호, 확인_잘못된상담시작, 확인_잘못된상담종료, 확인_너무긴상담시간, CONSULT_id, createdAt)
      VALUES('${query.client.ACMANAG}', '${query.unitNumber}', '${query.oracleRoomName}', '${query.userNumber}', 
      CONVERT(DATETIME, '${query.startTime}'), CONVERT(DATETIME, '${query.endTime}'), '${query.client.PSNAME}', '${query.client.PSENTRY}', 
      ${query.isWrongFoot}, ${query.isWrongEnding}, ${query.isWrongLength}, ${consultID}, SYSDATETIME())`, consultID:consultID, segmentIDs:data11}, { status:201 });
    } else {
      return NextResponse.json({ success:false, message:'등록되지 않은 지점코드라 업로드 할 수 없습니다.' }, { status:200 });
    }
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}

export async function PUT(request) {
  const query = await request.json();
  try {
    const data0 = await ExecuteQuery(`INSERT INTO CORE_CONSULT_ARTICLES (CONSULT_id, EDITOR_id, createdAt) VALUES (${query.consultID}, ${query.editorID}, SYSDATETIME())`);
    const data00 = await ExecuteQuery(`SELECT IDENT_CURRENT('CORE_CONSULT_ARTICLES') AS LAST_ID`);
    const articleID = data00[0].LAST_ID;
    query.segments.map(async (segment, index) => {
      const data1 = await ExecuteQuery(`INSERT INTO CORE_CONSULT_SEGMENTS (ADMIN_id, CLIENT_id, GENTILE_id, ARTICLE_id, START_TIME, END_TIME, TEXT, CONFIDENCE, SPEAKER, createdAt) 
      VALUES (${segment.ADMIN_id}, ${segment.CLIENT_id}, ${segment.GENTILE_id}, ${articleID}, ${segment.START_TIME}, ${segment.END_TIME}, '${segment.TEXT}', ${segment.CONFIDENCE}, '${segment.SPEAKER}', SYSDATETIME())`);
    })
    const data2 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_CONSULTS WHERE _id = ${query.consultID}`);
    if(data2[0].STATUS_NUMBER == 1) {
      const data3 = await ExecuteQuery(`UPDATE CORE_CONSULTS SET STATUS_NUMBER = 2, updatedAt = SYSDATETIME() WHERE _id = ${query.consultID}`);
    }
    return NextResponse.json({ success:true, message:'수정완료' }, { status:201 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}