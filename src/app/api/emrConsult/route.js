import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../utils/msSql';

export async function GET(request) {
  try {
    let count = 1;
    if(request.nextUrl.searchParams.get('index')) count = request.nextUrl.searchParams.get('index');
    let conditions = '';
    if(request.nextUrl.searchParams.get('psEntry') != null && request.nextUrl.searchParams.get('psEntry') != '')
    conditions += ` AND PE.PSENTRY LIKE '%${request.nextUrl.searchParams.get('psEntry')}%'`;
    if(request.nextUrl.searchParams.get('psName') != null && request.nextUrl.searchParams.get('psName') != '')
    conditions += ` AND PE.PSNAME LIKE '%${request.nextUrl.searchParams.get('psName')}%'`;
    if(request.nextUrl.searchParams.get('dateFrom') != null && request.nextUrl.searchParams.get('dateFrom') != '')
    conditions += ` AND PE.MEETDATE >= '${request.nextUrl.searchParams.get('dateFrom')}'`;
    if(request.nextUrl.searchParams.get('dateTo') != null && request.nextUrl.searchParams.get('dateTo') != '')
    conditions += ` AND PE.MEETDATE <= '${request.nextUrl.searchParams.get('dateTo')}'`;
    const data = await ExecuteQuery(`SELECT STT.CONSULT_id, STT.POSITION_NAME, STT.STATUS_NUMBER, PE.MEETDATE, CASE WHEN ADMIN_NAME IS NULL THEN SS.USER_NAME ELSE ADMIN_NAME END AS ADMIN_NAME, CASE WHEN STT.START_TIME IS NULL THEN CONCAT(PE.MEETDATE,' ',SUBSTRING(PE.STARTTIME,1,2),':',SUBSTRING(PE.STARTTIME,3,2),':',SUBSTRING(PE.STARTTIME,5,2)) ELSE STT.START_TIME END AS START_TIME, CASE WHEN STT.END_TIME IS NULL THEN CONCAT(PE.MEETDATE,' ',SUBSTRING(PE.ENDTIME,1,2),':',SUBSTRING(PE.ENDTIME,3,2),':00') ELSE STT.END_TIME END AS END_TIME, CASE WHEN STT.BRANCH_NAME IS NULL THEN HS.HOS_NAME ELSE STT.BRANCH_NAME END AS BRANCH_NAME, PE.PSENTRY, PSNAME, LICENCE AS LICENSE, PE.STARTBRAN AS BRANCH_INFO_CODE, PE.CONCNT, PE.MEETROOM FROM (SELECT * FROM tsfmc_data.dbo.PEO100T WHERE STARTBRAN IN ('18','21','34','35','36')) PE LEFT JOIN (SELECT ADMIN_NAME, C._id AS CONSULT_id, PSENTRY, CONVERT(CHAR(8), C.START_TIME, 112) AS MEETDATE, START_TIME, END_TIME, BRANCH_INFO_CODE, BRANCH_NAME, POSITION_NAME, STATUS_NUMBER FROM CORE_CONSULTS C, CORE_BRANCHES B, CORE_ADMIN_POSITION AP, CORE_ADMINS A, CORE_CLIENTS P WHERE C.ADMIN_id = A._id AND C.BRANCH_id = B._id AND A.POSITION_id = AP._id AND C.CLIENT_id = P._id) STT ON PE.PSENTRY = STT.PSENTRY AND PE.MEETDATE = STT.MEETDATE AND PE.STARTBRAN = STT.BRANCH_INFO_CODE, tsfmc_data.dbo.ADM010T AM, tsfmc_data.dbo.HOS000T HS, tsfmc_data.dbo.SYS080T SS WHERE PE.INGUBUN='U01-010' AND PE.STARTBRAN!='90' AND PE.VOICERECORDFILE IS NOT NULL AND PE.PSENTRY = AM.PSENTRY AND HS.HOS_CODE = PE.STARTBRAN AND SS.USER_ID = PE.MEETUSER${conditions} ORDER BY PE.MEETDATE DESC, PE.STARTTIME DESC OFFSET ${(count-1)*10} ROWS FETCH NEXT 10 ROWS ONLY`);
    const totalCount = await ExecuteQuery(`SELECT COUNT(*) AS count FROM (SELECT * FROM tsfmc_data.dbo.PEO100T WHERE STARTBRAN IN ('18','21','34','35','36')) PE WHERE PE.INGUBUN='U01-010' AND PE.STARTBRAN!='90' AND PE.VOICERECORDFILE IS NOT NULL${conditions}`);
    return NextResponse.json({success:true, data:data, totalCount:totalCount[0].count}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}