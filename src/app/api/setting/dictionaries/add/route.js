import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function POST(request) {
  const query = await request.json();
  try {
    const data0 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_DICTIONARIES WHERE WORD = '${query.keyword}'`);
    if(data0.length > 0) {
      return NextResponse.json({success:false, message:'단어가 이미 존재합니다.'}, { status: 200 });
    }else {
      const data = await ExecuteQuery(`INSERT INTO CORE_DICTIONARIES (WORD, ADMIN_id, createdAt) VALUES ('${query.keyword}', '${query.adminID}', SYSDATETIME())`);
      return NextResponse.json({ success:true}, { status:201 });
    }
    return NextResponse.json({ success:true, data:data.length }, { status: 200 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}