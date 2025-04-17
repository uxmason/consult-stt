import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../utils/msSql';

export async function GET(request) {
  try {
    let count = 1;
    if(request.nextUrl.searchParams.get('index')) count = request.nextUrl.searchParams.get('index');
    let conditions = '';
    if(request.nextUrl.searchParams.get('psEntry') != null && request.nextUrl.searchParams.get('psEntry') != '')
    conditions += ` AND P.PSENTRY LIKE '%${request.nextUrl.searchParams.get('psEntry')}%'`;
    if(request.nextUrl.searchParams.get('psName') != null && request.nextUrl.searchParams.get('psName') != '')
    conditions += ` AND P.PSNAME LIKE '%${request.nextUrl.searchParams.get('psName')}%'`;
    if(request.nextUrl.searchParams.get('dateFrom') != null && request.nextUrl.searchParams.get('dateFrom') != '')
    conditions += ` AND C.START_TIME >= CONVERT(DATE, '${request.nextUrl.searchParams.get('dateFrom')}')`;
    if(request.nextUrl.searchParams.get('dateTo') != null && request.nextUrl.searchParams.get('dateTo') != '')
    conditions += ` AND C.END_TIME <= CONVERT(DATETIME, '${request.nextUrl.searchParams.get('dateTo')} 23:59:59')`;
    if(request.nextUrl.searchParams.get('sorting') != null && request.nextUrl.searchParams.get('sorting') != '') {
      if(request.nextUrl.searchParams.get('sorting') == 1) conditions += ` AND C.STATUS_NUMBER IN (0,1)`;
      if(request.nextUrl.searchParams.get('sorting') == 2) conditions += ` AND C.STATUS_NUMBER = 0`;
    }
    const data = await ExecuteQuery(`SELECT C._id AS CONSULT_id, * FROM CORE_CONSULTS C, CORE_BRANCHES B, CORE_ADMIN_POSITION AP, CORE_ADMINS A, CORE_CLIENTS P
    WHERE C.ADMIN_id = A._id AND C.BRANCH_id = B._id AND A.POSITION_id = AP._id AND C.CLIENT_id = P._id${conditions}
    ORDER BY C.START_TIME DESC OFFSET ${(count-1)*10} ROWS FETCH NEXT 10 ROWS ONLY`);
    const totalCount = await ExecuteQuery(`SELECT COUNT(*) AS count FROM CORE_CONSULTS C, CORE_ADMINS A, CORE_CLIENTS P
    WHERE C.ADMIN_id = A._id AND C.CLIENT_id = P._id${conditions}`);
    return NextResponse.json({success:true, data:data, totalCount:totalCount[0].count}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}