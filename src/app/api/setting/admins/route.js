import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../utils/msSql';

export async function GET(request) {
  try {
    let count = 1;
    if(request.nextUrl.searchParams.get('index')) count = request.nextUrl.searchParams.get('index');
    const data = await ExecuteQuery(`SELECT A._id AS derived_ADMIN_id, * FROM CORE_ADMINS A LEFT JOIN CUSTOM_ADMINS CA ON A._id = CA.ADMIN_id, CORE_ADMIN_POSITION P, CORE_ADMIN_RANK R, CORE_BRANCHES B
    WHERE A.POSITION_id = P._id AND A.RANK_id = R._id AND A.BRANCH_id = B._id
    ORDER BY A.createdAt DESC OFFSET ${(count-1)*10} ROWS FETCH NEXT 10 ROWS ONLY`);
    const totalCount = await ExecuteQuery(`SELECT COUNT(*) AS count FROM CORE_ADMINS`);
    return NextResponse.json({success:true, data:data, totalCount:totalCount[0].count}, { status: 200 });
  } catch(e) {
    return NextResponse.json({success:false, message:e.message}, { status: 500 });
  }
}