import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../utils/msSql';

export async function GET(request) {
  try {
    let count = 1;
    if(request.nextUrl.searchParams.get('index')) count = request.nextUrl.searchParams.get('index');
    const data = await ExecuteQuery(`SELECT * FROM CORE_CLIENTS C, CORE_BRANCHES B WHERE C.BRANCH_id = B._id ORDER BY C.createdAt DESC OFFSET ${(count-1)*10} ROWS FETCH NEXT 10 ROWS ONLY`);
    const totalCount = await ExecuteQuery(`SELECT COUNT(*) AS count FROM CORE_CLIENTS`);
    return NextResponse.json({success:true, data:data, totalCount:totalCount[0].count}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}