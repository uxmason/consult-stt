import sql from 'mssql';
import { NextRequest, NextResponse  } from 'next/server';
import ExecuteQuery from '../../../../../utils/msSql';

export async function POST(request) {
  const query = await request.json();
  try {
    const data0 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_BRANCHES WHERE BRANCH_INFO_CODE = '${query.textCode}'`);
    if(data0.length > 0) {
      return NextResponse.json({success:false, message:'지점 코드가 이미 존재합니다.'}, { status: 200 });
    }else {
      const data1 = await ExecuteQuery(`SELECT TOP 1 * FROM CORE_BRANCHES WHERE BRANCH_NAME = '${query.textName}'`);
      if(data1.length > 0) {
        return NextResponse.json({success:false, message:'지점 이름이 이미 존재합니다.'}, { status: 200 });
      }else {
        const data = await ExecuteQuery(`INSERT INTO CORE_BRANCHES (BRANCH_NAME, BRANCH_INFO_CODE, createdAt) VALUES ('${query.textName}', '${query.textCode}', SYSDATETIME())`);
        return NextResponse.json({ success:true}, { status:201 });
      }
    }
    return NextResponse.json({success:true, data:data.length}, { status: 200 });
  } catch(e) {
    return NextResponse.json({ success:false, message:e.message }, { status:500 });
  }
}